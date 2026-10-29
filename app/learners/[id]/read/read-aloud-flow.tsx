"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Phase =
  | "setup"
  | "ready"
  | "recording"
  | "sending"
  | "transcript"
  | "manual";

interface Props {
  learnerId: string;
  forms: { form: string; sentences: string[] }[];
}

export function ReadAloudFlow({ learnerId, forms }: Props) {
  const [form, setForm] = useState("A");
  const [condition, setCondition] = useState("baseline");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [message, setMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const active = forms.find((f) => f.form === form) ?? forms[0];

  async function startAttempt() {
    setMessage(null);
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        learner_id: learnerId,
        form,
        condition,
      }),
    });
    if (!res.ok) {
      setMessage("Could not start the reading. Try again.");
      return;
    }
    const data = (await res.json()) as { attempt: { id: string } };
    setAttemptId(data.attempt.id);
    setPhase("ready");
  }

  async function startRecording() {
    setMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        sendRecording();
      };
      recorderRef.current = recorder;
      recorder.start();
      setPhase("recording");
    } catch {
      setMessage("The microphone is not available. You can type what you heard instead.");
      setPhase("manual");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setPhase("sending");
  }

  async function sendRecording() {
    if (!attemptId) return;
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    if (blob.size === 0) {
      setMessage("The recording was empty. Try again, or type what you heard.");
      setPhase("manual");
      return;
    }
    const body = new FormData();
    body.append("audio", blob, "reading.webm");
    const res = await fetch(`/api/attempts/${attemptId}/transcribe`, {
      method: "POST",
      body,
    });
    if (!res.ok) {
      setMessage(
        "The recording could not be transcribed. Your attempt was kept. Try again, or type what you heard."
      );
      setPhase("manual");
      return;
    }
    const data = (await res.json()) as { transcript: string; empty: boolean };
    if (data.empty) {
      setMessage("The transcript came back empty. Type what you heard instead.");
      setPhase("manual");
      return;
    }
    setTranscript(data.transcript);
    setDraft(data.transcript);
    setPhase("transcript");
  }

  async function saveManual() {
    if (!attemptId || draft.trim().length === 0) {
      setMessage("Type what you heard first.");
      return;
    }
    const res = await fetch(`/api/attempts/${attemptId}/transcript`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: draft.trim() }),
    });
    if (!res.ok) {
      setMessage("Could not save the transcript. Try again.");
      return;
    }
    setTranscript(draft.trim());
    setPhase("transcript");
    setMessage("Transcript saved.");
  }

  if (phase === "setup") {
    return (
      <div className="mt-6 flex max-w-md flex-col gap-4">
        <label className="flex flex-col gap-1">
          Passage form
          <select
            value={form}
            onChange={(e) => setForm(e.target.value)}
            className="rounded border border-rule bg-paper px-3 py-2"
          >
            {forms.map((f) => (
              <option key={f.form} value={f.form}>
                Form {f.form}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Condition
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="rounded border border-rule bg-paper px-3 py-2"
          >
            <option value="baseline">Baseline (no support)</option>
            <option value="support">With support</option>
            <option value="followup">Follow-up</option>
          </select>
        </label>
        <button
          type="button"
          onClick={startAttempt}
          className="w-fit rounded bg-pine px-4 py-2 text-white"
        >
          Start reading
        </button>
        {message ? <p role="status">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="rounded bg-paper p-6" style={{ fontSize: 32, lineHeight: 1.6 }}>
        {active?.sentences.map((s, i) => (
          <p key={i} className="mb-4">
            {s}
          </p>
        ))}
      </div>
      {(phase === "ready" || phase === "recording" || phase === "sending") && (
        <div className="mt-4 flex gap-3">
          {phase !== "recording" && phase !== "sending" ? (
            <button
              type="button"
              onClick={startRecording}
              className="rounded bg-pine px-6 py-3 text-white"
            >
              Start recording
            </button>
          ) : null}
          {phase === "recording" ? (
            <button
              type="button"
              onClick={stopRecording}
              className="rounded bg-madder px-6 py-3 text-white"
            >
              Stop and save
            </button>
          ) : null}
          {phase === "sending" ? <p role="status">Transcribing. The audio is then discarded.</p> : null}
          {phase === "ready" ? (
            <button type="button" onClick={() => setPhase("manual")} className="underline">
              Skip recording, type instead
            </button>
          ) : null}
        </div>
      )}
      {phase === "manual" && (
        <div className="mt-4 flex max-w-xl flex-col gap-3">
          <label className="flex flex-col gap-1">
            Type exactly what the learner read
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="rounded border border-rule bg-paper px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={saveManual}
            className="w-fit rounded bg-pine px-4 py-2 text-white"
          >
            Save transcript
          </button>
        </div>
      )}
      {phase === "transcript" && transcript !== null && attemptId !== null && (
        <div className="mt-4">
          <h2 className="font-serif text-2xl">Transcript</h2>
          <p className="mt-2 rounded bg-paper p-4">{transcript}</p>
          <p className="mt-3">
            <Link className="underline" href={`/attempts/${attemptId}`}>
              Open the attempt
            </Link>
          </p>
        </div>
      )}
      {message ? (
        <p role="status" className="mt-3">
          {message}
        </p>
      ) : null}
    </div>
  );
}
