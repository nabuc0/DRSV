"use client"
import { Textarea } from "@/components/ui/textarea"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  // In a real implementation, you would use a rich text editor library
  // like TipTap, Lexical, or Draft.js
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your content here... You can use HTML tags for formatting."
        className="min-h-[200px]"
      />
      <p className="text-xs text-muted-foreground">
        You can use basic HTML tags like &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
      </p>
    </div>
  )
}
