import { useState } from "react";
import { compileConfig, validateConfig, defaultConfigTemplate } from "@/lib/vanta/config-compiler";
import { providers } from "@/lib/vanta/providers";
import { SiteChrome } from "./SiteChrome";

export function Configurator() {
  const [template] = useState(defaultConfigTemplate);
  const validation = validateConfig(template);
  const compiled = validation.ok ? compileConfig(template) : null;
  const [message, setMessage] = useState<string | null>(null);

  async function onDeploy() {
    const provider = providers[0];
    const result = await provider.deploy(compiled?.ini ?? "");
    setMessage(result.message);
  }

  return (
    <SiteChrome>
      <section aria-labelledby="config-title" className="py-14 md:py-20">
        <p className="kicker">Config compiler</p>
        <h2 id="config-title" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Server configuration preview
        </h2>
        {validation.ok ? (
          <>
            <pre className="mt-6 max-h-96 overflow-auto rounded-md border border-vanta-ash bg-vanta-slate p-4 text-xs">
              {compiled?.ini}
            </pre>
            {compiled?.warnings.length ? (
              <ul className="mt-4 space-y-1 text-sm text-vanta-ash">
                {compiled.warnings.map((w, i) => (
                  <li key={i}>- {w}</li>
                ))}
              </ul>
            ) : null}
            <p className="mt-2 text-xs text-vanta-muted">Checksum: {compiled?.checksum}</p>
            <button
              type="button"
              onClick={onDeploy}
              className="mt-4 inline-flex min-h-12 items-center rounded-md bg-vanta-ember px-5 font-medium text-vanta-basalt"
            >
              Deploy (owner-gated)
            </button>
          </>
        ) : (
          <ul className="mt-4 space-y-1 text-sm text-vanta-ash">
            {!validation.ok ? validation.errors.map((e, i) => <li key={i}>- {e}</li>) : null}
          </ul>
        )}
        {message ? (
          <p role="status" className="mt-4 text-sm text-vanta-ash">
            {message}
          </p>
        ) : null}
      </section>
    </SiteChrome>
  );
}
