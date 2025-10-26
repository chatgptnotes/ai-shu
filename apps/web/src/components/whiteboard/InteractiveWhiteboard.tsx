/**
 * Interactive Whiteboard Component
 * Provides a collaborative drawing and visualization tool for learning
 * Uses tldraw for a powerful whiteboard experience
 */

'use client';

import { useState, useCallback } from 'react';
import { Tldraw, Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { toast } from 'sonner';

interface InteractiveWhiteboardProps {
  sessionId: string;
  onSave?: (snapshot: any) => void;
  initialData?: any;
  readOnly?: boolean;
}

export function InteractiveWhiteboard({
  sessionId,
  onSave,
  initialData,
  readOnly = false,
}: InteractiveWhiteboardProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);

    // Load initial data if provided
    if (initialData) {
      try {
        editor.store.loadSnapshot(initialData);
      } catch (error) {
        console.error('Error loading whiteboard data:', error);
        toast.error('Failed to load whiteboard data');
      }
    }
  }, [initialData]);

  const handleSave = useCallback(async () => {
    if (!editor) return;

    setIsSaving(true);
    try {
      const snapshot = editor.store.getSnapshot();
      if (onSave) {
        await onSave(snapshot);
      }
      toast.success('Whiteboard saved successfully');
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      toast.error('Failed to save whiteboard');
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave]);

  const handleClear = useCallback(() => {
    if (!editor) return;

    if (confirm('Are you sure you want to clear the whiteboard?')) {
      editor.selectAll();
      editor.deleteShapes(editor.getSelectedShapeIds());
      toast.success('Whiteboard cleared');
    }
  }, [editor]);

  const handleExport = useCallback(async () => {
    if (!editor) return;

    try {
      // Export as PNG
      const shapeIds = Array.from(editor.getCurrentPageShapeIds());
      if (shapeIds.length === 0) {
        toast.error('Nothing to export');
        return;
      }

      const svg = await editor.getSvg(shapeIds);
      if (!svg) {
        toast.error('Failed to generate image');
        return;
      }

      // Convert SVG to data URL
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      // Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `whiteboard-${sessionId}-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Whiteboard exported successfully');
    } catch (error) {
      console.error('Error exporting whiteboard:', error);
      toast.error('Failed to export whiteboard');
    }
  }, [editor, sessionId]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-2 border-b bg-card p-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !editor}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleClear}
            disabled={!editor}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            Clear
          </button>
          <button
            onClick={handleExport}
            disabled={!editor}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            Export
          </button>
        </div>
      )}

      {/* Whiteboard Canvas */}
      <div className="flex-1">
        <Tldraw
          onMount={handleMount}
          autoFocus
          hideUi={readOnly}
        />
      </div>
    </div>
  );
}
