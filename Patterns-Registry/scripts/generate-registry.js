const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = path.join(__dirname, '../registry/new-york/patterns');
const REGISTRY_FILE = path.join(__dirname, '../registry.json');

function getAllPatternFiles(dir, baseDir = dir) {
  let files = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(getAllPatternFiles(fullPath, baseDir));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

function generateRegistryEntries() {
  console.log('Generating registry entries...\n');

  const patternFiles = getAllPatternFiles(PATTERNS_DIR);
  const entries = [];

  // Group by category
  const categories = {};

  for (const file of patternFiles) {
    const parts = file.split(path.sep);
    const category = parts[0];

    if (!categories[category]) {
      categories[category] = [];
    }

    categories[category].push(file);
  }

  // Generate entries
  for (const [category, files] of Object.entries(categories)) {
    for (const file of files) {
      const fileName = path.basename(file, path.extname(file));
      const patternName = `pattern-${fileName}`;

      entries.push({
        name: patternName,
        type: "registry:component",
        title: fileName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: `A ${category} pattern: ${fileName}`,
        registryDependencies: [], // TODO: Parse imports to determine dependencies
        files: [
          {
            path: `registry/new-york/patterns/${file}`,
            type: "registry:component"
          }
        ]
      });
    }
  }

  console.log(`Generated ${entries.length} registry entries`);
  console.log(`Categories: ${Object.keys(categories).length}`);

  // Read existing registry.json
  const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));

  // Add new entries
  registry.items = [...registry.items, ...entries];

  // Write back
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));

  console.log('\n✓ Registry updated successfully!');
  console.log(`✓ Total items in registry: ${registry.items.length}`);
}

// Run
if (!fs.existsSync(PATTERNS_DIR)) {
  console.error('Error: Patterns directory not found!');
  console.error('Please run ./scripts/import-kibo-patterns.sh first');
  process.exit(1);
}

generateRegistryEntries();
