import { Buffer } from 'node:buffer'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'
import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js'

// Path to skills source: extension/scripts -> extension -> packages -> browser-pilot -> skills
const SKILLS_DIR = join(import.meta.dirname, '../../../skills/built-in')
const OUTPUT_DIR = join(import.meta.dirname, '../public/skills')
const OUTPUT_PATH = join(OUTPUT_DIR, 'built-in.zip')

/**
 * Recursively add files to zip writer
 */
async function addFilesToZip(
  zipWriter: ZipWriter<Blob>,
  dir: string,
  baseDir: string,
): Promise<void> {
  const entries = readdirSync(dir)

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const relativePath = relative(baseDir, fullPath)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      await addFilesToZip(zipWriter, fullPath, baseDir)
    }
    else {
      const content = readFileSync(fullPath, 'utf-8')
      await zipWriter.add(relativePath, new TextReader(content))
    }
  }
}

/**
 * Zip skills directory to public/skills/builtin.zip
 */
async function zipSkills(): Promise<void> {
  // Check if source directory exists
  if (!existsSync(SKILLS_DIR)) {
    console.error(`Skills directory not found: ${SKILLS_DIR}`)
    console.error(`Current __dirname: ${__dirname}`)
    process.exit(1)
  }

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log(`Zipping skills from: ${SKILLS_DIR}`)
  console.log(`Output to: ${OUTPUT_PATH}`)

  const zipWriter = new ZipWriter(new BlobWriter())

  // Recursively add all files
  await addFilesToZip(zipWriter, SKILLS_DIR, SKILLS_DIR)

  // Close and get blob
  const blob = await zipWriter.close()
  const arrayBuffer = await blob.arrayBuffer()

  // Write to output path
  writeFileSync(OUTPUT_PATH, Buffer.from(arrayBuffer))

  console.log(`✅ Skills zipped successfully: ${OUTPUT_PATH}`)
}

zipSkills().catch((error) => {
  console.error('Failed to zip skills:', error)
  process.exit(1)
})
