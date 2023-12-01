"use client";
import { useCallback, useEffect } from "react";
import useCodeMirror from "@/lib/use-codemirror";

interface Props {
  initialDock: string;
  onChange: (doc: string) => void;
}

const TextEditor: React.FC<Props> = (props) => {
  const { onChange, initialDock } = props;
  const handleChange = useCallback(
    (state: any) => onChange(state.doc.toString()),
    [onChange],
  );
  const [refContainer, editorView] = useCodeMirror<HTMLDivElement>({
    initialDoc: initialDock,
    onChange: handleChange,
  });
  useEffect(() => {
    if (editorView) {
      console.log(editorView);
    }
  }, [editorView]);

  return (
    <section className="h-full w-full">
      <div
        className="editor-wrapper  h-full w-full mx-auto flex flex-col gap-2"
        ref={refContainer}
      />
    </section>
  );
};

export default TextEditor;
