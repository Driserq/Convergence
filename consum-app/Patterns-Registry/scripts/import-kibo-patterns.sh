#!/bin/bash

# Script to import all Kibo UI patterns into the registry

SOURCE_DIR="/tmp/kibo-source/packages/patterns"
DEST_DIR="/Users/hammad/Developer/kibo/kibo-registry/registry/new-york/patterns"

# Create destination directory
mkdir -p "$DEST_DIR"

# Counter
TOTAL=0

echo "Starting import of Kibo UI patterns..."
echo "Source: $SOURCE_DIR"
echo "Destination: $DEST_DIR"
echo ""

# Copy all pattern directories
for category in "$SOURCE_DIR"/*/ ; do
  category_name=$(basename "$category")

  # Skip if it's a file
  if [ ! -d "$category" ]; then
    continue
  fi

  echo "Processing category: $category_name"

  # Copy the entire category
  cp -r "$category" "$DEST_DIR/$category_name"

  # Count files
  file_count=$(find "$DEST_DIR/$category_name" -name "*.tsx" -o -name "*.ts" | wc -l | tr -d ' ')
  TOTAL=$((TOTAL + file_count))

  echo "  - Copied $file_count files"
done

echo ""
echo "✓ Import complete!"
echo "✓ Total patterns imported: $TOTAL"
echo ""
echo "Next steps:"
echo "1. Run: node scripts/generate-registry.js"
echo "2. This will generate registry.json entries for all patterns"
