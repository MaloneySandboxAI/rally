"use client"

import React from "react"

/**
 * MathText — renders math notation nicely:
 *  - Converts ^ into real superscripts (x^2 → x<sup>2</sup>)
 *  - Wraps equation-like expressions in nowrap spans so they
 *    don't break mid-equation on narrow screens
 *
 * Exponent patterns handled:
 *   x^2        → x²
 *   2^(x+1)    → 2⁽ˣ⁺¹⁾  (superscripted group)
 *   x^{12}     → x¹²       (braces stripped)
 *   cos^2(t)   → cos²(t)
 *   3x^4 - 2x^2 + 7x - 1  →  3x⁴ - 2x² + 7x - 1
 */

// Regex: match ^ followed by:
//   - a parenthesized group like (x+1)
//   - a braced group like {12}
//   - one or more consecutive digits (greedy)
//   - a single letter (for things like x^n, b^x)
const EXPONENT_RE = /\^(\([^)]+\)|\{([^}]+)\}|\d+|[a-zA-Z])/g

/**
 * Converts a text string with ^ exponents into React elements
 * with proper <sup> tags.
 */
function renderExponents(text: string): React.ReactNode[] {
  if (!text.includes("^")) {
    return [text]
  }

  const parts: React.ReactNode[] = []
  let lastIndex = 0

  EXPONENT_RE.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = EXPONENT_RE.exec(text)) !== null) {
    const fullMatch = match[0] // e.g. "^2" or "^(x+1)" or "^{12}"
    const rawGroup = match[1]  // e.g. "2" or "(x+1)" or "{12}"
    const bracedContent = match[2] // only if braces were used: "12"

    // Add text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Determine the exponent display content (strip braces if used)
    const expContent = bracedContent ?? rawGroup

    parts.push(
      <sup
        key={`exp-${match.index}`}
        style={{ fontSize: "0.7em", verticalAlign: "super", lineHeight: 0 }}
      >
        {expContent}
      </sup>
    )

    lastIndex = match.index + fullMatch.length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

/**
 * Wraps equation-like expressions in nowrap spans so they stay on one line.
 *
 * Detects expressions like:
 *   f(x) = 3x^4 - 2x^2 + 7x - 1
 *   x^2 + y^2 = 1
 *   3x + 2 = 14
 *
 * Strategy: find sequences containing math operators (=, +, -, *, /)
 * mixed with variables/numbers, and wrap each in a nowrap span.
 */
const EQUATION_RE = /(?:[a-zA-Z0-9_()\[\]{}·×÷±√πθ^]+\s*[=<>≤≥+\-*/]\s*)+[a-zA-Z0-9_()\[\]{}·×÷±√πθ^]+/g

function wrapEquationsNoWrap(nodes: React.ReactNode[]): React.ReactNode[] {
  // Process each text node — replace equation-like substrings with nowrap spans
  // For non-string nodes (like <sup>), pass them through
  const result: React.ReactNode[] = []

  // First, join all string parts back together to find equation boundaries,
  // then re-split. This is needed because exponent processing may have split
  // an equation into [text, <sup>, text] fragments.
  // Simpler approach: wrap the entire MathText output in a span that
  // prevents orphaned breaks within math expressions.

  return nodes
}

/**
 * MathText component — drop-in replacement for raw text rendering.
 *
 * Usage: <MathText text={question.question} />
 *
 * Renders exponents as superscripts and prevents equation line-wrapping.
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  if (!text) return null

  // If no math content, return plain text
  if (!text.includes("^") && !text.includes("=")) {
    return <span className={className}>{text}</span>
  }

  // Step 1: Split by sentence-level boundaries to identify equation chunks
  // We want equations to stay on one line, but regular prose can wrap normally.
  // Strategy: find equation-like substrings and wrap them in nowrap spans,
  // then render exponents within those spans.

  const parts: React.ReactNode[] = []
  let lastIdx = 0

  EQUATION_RE.lastIndex = 0
  let m: RegExpExecArray | null

  while ((m = EQUATION_RE.exec(text)) !== null) {
    // Add any prose before this equation
    if (m.index > lastIdx) {
      const prose = text.slice(lastIdx, m.index)
      if (prose.includes("^")) {
        parts.push(...renderExponents(prose))
      } else {
        parts.push(prose)
      }
    }

    // Wrap equation in nowrap, with exponent rendering
    const eqText = m[0]
    parts.push(
      <span key={`eq-${m.index}`} style={{ whiteSpace: "nowrap" }}>
        {renderExponents(eqText)}
      </span>
    )

    lastIdx = m.index + m[0].length
  }

  // Add any remaining text after the last equation
  if (lastIdx < text.length) {
    const remaining = text.slice(lastIdx)
    if (remaining.includes("^")) {
      parts.push(...renderExponents(remaining))
    } else {
      parts.push(remaining)
    }
  }

  // If no equations were found but there are exponents, just render exponents
  if (parts.length === 0) {
    return <span className={className}>{renderExponents(text)}</span>
  }

  return <span className={className}>{parts}</span>
}
