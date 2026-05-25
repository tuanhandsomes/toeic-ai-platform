import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');
const diagramsDir = path.join(projectRoot, 'docs', 'diagrams');
const plantumlJar = path.join(projectRoot, 'tools', 'plantuml.jar');

if (!existsSync(plantumlJar)) {
  console.error(`Không tìm thấy plantuml.jar tại ${plantumlJar}`);
  console.error('Tải về từ: https://repo1.maven.org/maven2/net/sourceforge/plantuml/plantuml/1.2024.7/plantuml-1.2024.7.jar');
  process.exit(1);
}

const env = { ...process.env };
const dotInPath = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['dot'], { encoding: 'utf8' });
if (dotInPath.status !== 0) {
  const winDot = 'C:\\Program Files\\Graphviz\\bin\\dot.exe';
  if (existsSync(winDot)) {
    env.GRAPHVIZ_DOT = winDot;
    console.log(`Graphviz chưa có trong PATH — dùng ${winDot}`);
  } else {
    console.warn('Cảnh báo: không tìm thấy dot.exe. Class/Component diagram có thể fail.');
    console.warn('Cài: winget install Graphviz.Graphviz (rồi restart terminal)');
  }
}

// Walk diagramsDir recursively, find all .puml files
// For each, render to sibling png/ folder (relative to parent of puml/)
function walkPumlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkPumlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.puml')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Group by parent folder so we can render each batch with one JVM invocation
const allFiles = walkPumlFiles(diagramsDir);
if (allFiles.length === 0) {
  console.log(`Không có file .puml nào trong ${diagramsDir}`);
  process.exit(0);
}

const filesByOutputDir = new Map();
for (const file of allFiles) {
  const parentDir = path.dirname(file);
  // If parent folder is "puml/", output goes to sibling "png/"
  // Otherwise, output goes to "png/" subfolder next to the file
  const outputDir = path.basename(parentDir) === 'puml'
    ? path.join(path.dirname(parentDir), 'png')
    : path.join(parentDir, 'png');

  if (!filesByOutputDir.has(outputDir)) filesByOutputDir.set(outputDir, []);
  filesByOutputDir.get(outputDir).push(file);
}

const targetFormat = process.argv.includes('--svg') ? '-tsvg' : '-tpng';
console.log(`Đang render ${allFiles.length} biểu đồ trong ${filesByOutputDir.size} thư mục (${targetFormat.slice(2).toUpperCase()})...\n`);

let totalRendered = 0;
for (const [outputDir, files] of filesByOutputDir) {
  mkdirSync(outputDir, { recursive: true });
  const filesArg = files.map(f => `"${f}"`).join(' ');
  const cmd = `java -jar "${plantumlJar}" ${targetFormat} -charset UTF-8 -o "${outputDir}" ${filesArg}`;
  try {
    execSync(cmd, { stdio: 'inherit', env });
    const rel = path.relative(diagramsDir, outputDir);
    console.log(`  ✓ ${files.length} file → ${rel}`);
    totalRendered += files.length;
  } catch (err) {
    console.error(`  ✗ Lỗi khi render ${path.relative(diagramsDir, outputDir)}: ${err.message}`);
  }
}

console.log(`\n✓ Hoàn tất: ${totalRendered}/${allFiles.length} file`);
