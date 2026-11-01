// ClassFlow — import des supports de cours dans l'application.
// Utilisation (depuis la racine du projet, après avoir exécuté la migration 0003) :
//   Simulation : node scripts/import-cours.mjs "C:\chemin\vers\L3_IA" scripts/manifest_import_l3ia.tsv
//   Import réel: node scripts/import-cours.mjs "C:\chemin\vers\L3_IA" scripts/manifest_import_l3ia.tsv --go
// Le script se connecte avec LE COMPTE ADMINISTRATEUR (même règles de sécurité que l'application).
// Il utilise uniquement la clé publique de .env.local. Aucun mot de passe n'est enregistré.

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const MIME = {
  pdf: 'application/pdf', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv', txt: 'text/plain', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  zip: 'application/zip', ipynb: 'application/x-ipynb+json',
}
const MAX_BYTES = 20 * 1024 * 1024

const [rootDir, manifestPath] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const GO = process.argv.includes('--go')
if (!rootDir || !manifestPath) {
  console.error('Usage : node scripts/import-cours.mjs <dossier L3_IA> <manifest.tsv> [--go]')
  process.exit(1)
}

// --- lecture de .env.local (sans dépendance) ---
function loadEnv(file) {
  const env = {}
  if (!fs.existsSync(file)) return env
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return env
}
const env = loadEnv('.env.local')
const URL = env.VITE_SUPABASE_URL
const KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY
if (!URL || !KEY) {
  console.error('Variables manquantes dans .env.local (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).')
  process.exit(1)
}

// --- saisie au clavier (mot de passe masqué) ---
function ask(question, hidden = false) {
  return new Promise((resolve) => {
    process.stdout.write(question)
    const stdin = process.stdin
    let value = ''
    if (hidden && stdin.isTTY) stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          stdin.removeListener('data', onData)
          if (hidden && stdin.isTTY) stdin.setRawMode(false)
          stdin.pause()
          process.stdout.write('\n')
          return resolve(value)
        }
        if (ch === '\u0003') process.exit(1)
        if (ch === '\u007f' || ch === '\b') value = value.slice(0, -1)
        else value += ch
        if (!hidden) process.stdout.write(ch)
      }
    }
    stdin.on('data', onData)
  })
}

// --- manifeste ---
const norm = (p) => p.normalize('NFC').replace(/\\/g, '/').toLowerCase()
const lines = fs.readFileSync(manifestPath, 'utf8').split(/\r?\n/).filter(Boolean)
const items = lines.slice(1).map((l) => {
  const [decision, module, chemin, titre] = l.split('\t')
  return { decision, module, chemin, titre }
}).filter((x) => x.decision === 'inclure')

// --- index des fichiers présents sur le disque ---
const onDisk = new Map()
;(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else onDisk.set(norm(path.relative(rootDir, full)), full)
  }
})(rootDir)

const plan = items.map((it) => {
  const full = onDisk.get(norm(it.chemin))
  const ext = path.extname(it.chemin).slice(1).toLowerCase()
  const size = full ? fs.statSync(full).size : 0
  let problem = null
  if (!full) problem = 'fichier introuvable sur le disque'
  else if (!MIME[ext]) problem = `format .${ext} non autorisé`
  else if (size > MAX_BYTES) problem = 'plus de 20 Mo'
  else if (size === 0) problem = 'fichier vide'
  return { ...it, full, ext, size, problem }
})

console.log(`\n${plan.length} fichiers à importer, dont ${plan.filter((p) => p.problem).length} avec un problème.`)
for (const p of plan) console.log(`${p.problem ? 'SKIP' : ' OK '}  ${p.module}  ${p.chemin}${p.problem ? '   -> ' + p.problem : ''}`)

if (!GO) {
  console.log('\nSimulation terminée. Relance avec --go pour importer réellement.')
  process.exit(0)
}

// --- connexion administrateur ---
const supabase = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } })
const email = (await ask('Email administrateur : ')).trim()
const password = await ask('Mot de passe (masqué) : ', true)
const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email, password })
if (authError) { console.error('Connexion refusée :', authError.message); process.exit(1) }
const userId = auth.user.id
const { data: me } = await supabase.from('profiles').select('role, active').eq('id', userId).single()
if (!me || me.role !== 'administrateur' || !me.active) {
  console.error('Ce compte n\'est pas un administrateur actif. Arrêt.')
  process.exit(1)
}

const codes = [...new Set(plan.map((p) => p.module))]
const { data: courses, error: cErr } = await supabase.from('courses').select('id, class_id, code').in('code', codes)
if (cErr) { console.error('Lecture des cours impossible :', cErr.message); process.exit(1) }
const byCode = new Map(courses.map((c) => [c.code, c]))

let ok = 0, skipped = 0, failed = 0, streak = 0
for (const p of plan) {
  if (streak >= 3) { console.error('\n3 échecs de suite : arrêt. Envoie-moi les messages ci-dessus.'); break }
  if (p.problem) { skipped++; continue }
  const course = byCode.get(p.module)
  if (!course) { console.log(`ECHEC  ${p.chemin} : module ${p.module} introuvable`); failed++; streak++; continue }
  const fileName = path.basename(p.full)

  const { data: already } = await supabase.from('documents').select('id')
    .eq('course_id', course.id).eq('file_name', fileName).limit(1)
  if (already && already.length) { console.log(`DEJA   ${p.chemin}`); skipped++; continue }

  const storagePath = `${course.class_id}/${course.id}/${crypto.randomUUID()}.${p.ext}`
  const mime = MIME[p.ext]

  const { error: upErr } = await supabase.storage.from('documents')
    .upload(storagePath, fs.readFileSync(p.full), { contentType: mime, upsert: false })
  if (upErr) { console.log(`ECHEC  ${p.chemin} : envoi ${upErr.message}`); failed++; streak++; continue }

  const { data: doc, error: insErr } = await supabase.from('documents').insert({
    title: p.titre || fileName, file_name: fileName, storage_path: storagePath, mime_type: mime,
    size_bytes: p.size, description: 'Support de cours (import initial)', course_id: course.id, uploaded_by: userId,
  }).select('id').single()
  if (insErr) { console.log(`ECHEC  ${p.chemin} : base ${insErr.message}`); failed++; streak++; continue }

  const { error: revErr } = await supabase.rpc('review_document', { p_document_id: doc.id, p_decision: 'approved' })
  if (revErr) { console.log(`ATTENTE ${p.chemin} : validation impossible (${revErr.message})`); failed++; streak++; continue }

  console.log(`IMPORT ${p.module}  ${fileName}`)
  ok++
  streak = 0
}
console.log(`\nTerminé : ${ok} importés, ${skipped} ignorés, ${failed} en échec.`)
await supabase.auth.signOut()
process.exit(failed ? 1 : 0)
