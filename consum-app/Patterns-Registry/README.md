# Kibo UI Patterns Registry

A comprehensive shadcn/ui registry containing **1,105 production-ready patterns** from Kibo UI. This is a custom component registry that works seamlessly with the shadcn CLI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Patterns](https://img.shields.io/badge/patterns-1105-green.svg)
![Components](https://img.shields.io/badge/categories-53-orange.svg)

## 🎯 What's Inside

This registry contains all patterns from [Kibo UI](https://www.kibo-ui.com/) organized into **53 component categories**:

- 🎨 **Forms & Input** - 150+ patterns
- 🧭 **Navigation** - 80+ patterns
- 📊 **Charts** - 70+ patterns
- 💬 **Feedback** - 90+ patterns
- 🎭 **Overlays** - 120+ patterns
- 📋 **Data Display** - 200+ patterns
- 🔘 **Interactive** - 180+ patterns
- 📐 **Layout** - 60+ patterns
- 🛠️ **Utilities** - 155+ patterns

## 🚀 Quick Start

### 1. Clone and run this registry locally

```bash
# Clone the repository
git clone https://github.com/ailabs-393/Patterns-Registry.git
cd Patterns-Registry

# Install dependencies
pnpm install

# Build the registry
pnpm registry:build

# Start the development server
pnpm dev
```

The registry will be available at `http://localhost:3000`

### 2. Set up shadcn MCP in your project

Create or update `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": [
        "shadcn@latest",
        "mcp"
      ]
    }
  }
}
```

### 3. Add this registry to your `components.json`

```json
{
  "registries": {
    "@my-patterns": {
      "url": "http://localhost:3000/r/{name}.json"
    }
  }
}
```

**Note**: You can name the registry anything (e.g., `@my-patterns`, `@kibo-patterns`). Just make sure the URL points to `http://localhost:3000/r/{name}.json` while running locally.

### 4. Install patterns

```bash
# Install a button pattern
npx shadcn@latest add @my-patterns/pattern-button-destructive-1

# Install a form pattern
npx shadcn@latest add @my-patterns/pattern-form-validation-1

# Install a chart pattern
npx shadcn@latest add @my-patterns/pattern-chart-bar-default
```

### 5. Search patterns with MCP

If you have the shadcn MCP configured, you can search patterns directly:

```bash
# Search for button patterns
mcp__shadcn__search_items_in_registries --registries @my-patterns --query button

# Search for form patterns
mcp__shadcn__search_items_in_registries --registries @my-patterns --query form
```

## 📖 Documentation

Check out the [**PATTERNS_GUIDE.md**](./PATTERNS_GUIDE.md) for:
- Complete list of all 53 component categories
- Pattern variations within each category
- Usage examples and workflows
- Quick reference by use case

## 🗂️ Available Categories

<details>
<summary>View all 53 categories</summary>

1. accordion
2. alert
3. alert-dialog
4. aspect-ratio
5. avatar
6. badge
7. breadcrumb
8. button
9. button-group
10. calendar
11. card
12. carousel
13. chart
14. checkbox
15. collapsible
16. combobox
17. command
18. context-menu
19. data-table
20. date-picker
21. dialog
22. drawer
23. dropdown-menu
24. empty
25. field
26. form
27. hover-card
28. input
29. input-group
30. input-otp
31. item
32. kbd
33. label
34. menubar
35. navigation-menu
36. pagination
37. popover
38. progress
39. radio-group
40. scroll-area
41. separator
42. sheet
43. skeleton
44. slider
45. sonner
46. spinner
47. switch
48. table
49. tabs
50. textarea
51. toggle
52. toggle-group
53. tooltip

</details>

## 📋 Requirements

- Node.js 18+ or 20+
- pnpm (recommended) or npm
- A Next.js project with shadcn/ui initialized

## 🔧 How It Works

This registry works with shadcn's MCP (Model Context Protocol) server:

1. **Local Server**: The registry runs on `http://localhost:3000` and serves pattern JSON files
2. **components.json**: Your project's `components.json` points to the local registry
3. **MCP Integration**: The shadcn MCP server reads your `components.json` and enables searching/installing patterns
4. **Pattern Installation**: Use `npx shadcn@latest add` to install patterns from the registry

## 🌐 Deployment (Optional)

If you want to host this registry online instead of running it locally:

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ailabs-393/Patterns-Registry)

1. Import this repo to Vercel
2. Deploy (automatic)
3. Update your `components.json` with the Vercel URL:

```json
{
  "registries": {
    "@my-patterns": {
      "url": "https://your-app.vercel.app/r/{name}.json"
    }
  }
}
```

## 📚 Usage Examples

### Install multiple patterns

```bash
# Install a complete form setup
npx shadcn@latest add \
  @my-patterns/pattern-form-basic-forms-1 \
  @my-patterns/pattern-field-basic-inputs-1 \
  @my-patterns/pattern-button-standard-1
```

### Browse patterns

Check [PATTERNS_GUIDE.md](./PATTERNS_GUIDE.md) for a complete list of all 53 categories and 1,105 patterns

## 🎨 Pattern Showcase

### Button Patterns (97 variations)
- Standard buttons (7 variants)
- Destructive buttons (7 variants)
- Link buttons (7 variants)
- Outline buttons (7 variants)
- Secondary buttons (7 variants)
- Button groups (39 variants)

### Form Patterns (42 variations)
- Basic forms
- Advanced forms with validation
- Multi-field forms
- Form layouts
- Form patterns

### Chart Patterns (70 variations)
- Area charts (10 variants)
- Bar charts (10 variants)
- Line charts (10 variants)
- Pie charts (11 variants)
- Radar charts (14 variants)
- Radial charts (6 variants)
- Tooltips (9 variants)

## 🤝 Contributing

This registry contains patterns from [Kibo UI](https://www.kibo-ui.com/), which is open source and free forever.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Credits

- **Patterns Source**: [Kibo UI](https://www.kibo-ui.com/) by [Hayden Bleasel](https://github.com/haydenbleasel)
- **Registry Template**: [shadcn/ui registry-template](https://github.com/shadcn-ui/registry-template)
- **UI Framework**: [shadcn/ui](https://ui.shadcn.com/)

## 📞 Support

- 📖 [Documentation](./PATTERNS_GUIDE.md)
- 🐛 [Report Issues](https://github.com/ailabs-393/Patterns-Registry/issues)
- 💬 [Discussions](https://github.com/ailabs-393/Patterns-Registry/discussions)

---

**Made with ❤️ for the shadcn/ui community**
