#!/usr/bin/env npx tsx

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

/**
 * Debug script to identify potential chunk loading issues
 */

interface ComponentAnalysis {
  name: string
  path: string
  exists: boolean
  hasExport: boolean
  imports: string[]
  potentialIssues: string[]
}

function analyzeComponent(componentPath: string): ComponentAnalysis {
  const fullPath = join(process.cwd(), componentPath)
  const analysis: ComponentAnalysis = {
    name: componentPath.split('/').pop()?.replace('.tsx', '') || 'unknown',
    path: componentPath,
    exists: existsSync(fullPath),
    hasExport: false,
    imports: [],
    potentialIssues: []
  }

  if (!analysis.exists) {
    analysis.potentialIssues.push('File does not exist')
    return analysis
  }

  try {
    const content = readFileSync(fullPath, 'utf-8')
    
    // Check for export
    const exportMatches = content.match(/export\s+(function|const|default)/g)
    analysis.hasExport = !!exportMatches && exportMatches.length > 0
    
    if (!analysis.hasExport) {
      analysis.potentialIssues.push('No export statement found')
    }

    // Extract imports
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'))
    analysis.imports = importLines

    // Check for potential issues
    if (content.includes('import(')) {
      analysis.potentialIssues.push('Contains dynamic imports')
    }

    if (content.includes('require(')) {
      analysis.potentialIssues.push('Contains require() statements')
    }

    if (content.length > 50000) {
      analysis.potentialIssues.push('Large file size (>50KB)')
    }

    // Check for circular dependency patterns
    const relativeImports = importLines.filter(line => line.includes('../') || line.includes('./'))
    if (relativeImports.length > 10) {
      analysis.potentialIssues.push('Many relative imports (potential circular dependencies)')
    }

    // Check for missing 'use client' directive for client components
    if (content.includes('useState') || content.includes('useEffect') || content.includes('onClick')) {
      if (!content.includes('"use client"') && !content.includes("'use client'")) {
        analysis.potentialIssues.push('Client-side code without "use client" directive')
      }
    }

  } catch (error) {
    analysis.potentialIssues.push(`Error reading file: ${error}`)
  }

  return analysis
}

async function debugChunkLoading() {
  console.log('🔍 Chunk Loading Debug Analysis\n')

  const componentsToAnalyze = [
    'components/collaboration/enhanced-collaboration-hub.tsx',
    'components/collaboration/enhanced-collaboration-feed.tsx',
    'components/collaboration/real-time-activity-feed.tsx',
    'components/collaboration/enhanced-project-workspace.tsx',
    'components/collaboration/simple-collaboration-hub.tsx',
    'app/artist/community/page.tsx',
    'app/layout.tsx'
  ]

  const analyses: ComponentAnalysis[] = []

  for (const component of componentsToAnalyze) {
    console.log(`📝 Analyzing: ${component}`)
    const analysis = analyzeComponent(component)
    analyses.push(analysis)

    if (analysis.exists) {
      console.log(`   ✅ Exists: ${analysis.hasExport ? 'Has exports' : '❌ No exports'}`)
      if (analysis.potentialIssues.length > 0) {
        console.log(`   ⚠️  Issues:`)
        analysis.potentialIssues.forEach(issue => {
          console.log(`      - ${issue}`)
        })
      } else {
        console.log(`   ✅ No issues detected`)
      }
    } else {
      console.log(`   ❌ File does not exist`)
    }
    console.log()
  }

  // Summary
  console.log('📊 Summary:')
  const problematicComponents = analyses.filter(a => a.potentialIssues.length > 0)
  
  if (problematicComponents.length === 0) {
    console.log('✅ No obvious issues detected in component analysis')
  } else {
    console.log(`⚠️  Found ${problematicComponents.length} components with potential issues:`)
    problematicComponents.forEach(comp => {
      console.log(`   • ${comp.name}: ${comp.potentialIssues.join(', ')}`)
    })
  }

  // Recommendations
  console.log('\n💡 Recommendations:')
  console.log('1. The simplified components should work without chunk loading errors')
  console.log('2. Try accessing http://localhost:3000/artist/community now')
  console.log('3. If it works, gradually re-enable enhanced components one by one')
  console.log('4. The original issue was likely due to complex component dependencies')
  console.log('5. Consider code splitting for large components')

  // Next steps
  console.log('\n🚀 Next Steps:')
  console.log('1. Test the simplified version: http://localhost:3000/artist/community')
  console.log('2. If working, restore enhanced components gradually')
  console.log('3. Add error boundaries for complex components')
  console.log('4. Implement lazy loading for heavy features')
}

// Run the debug analysis
debugChunkLoading().catch(console.error)