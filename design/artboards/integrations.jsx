// Zenra — Integrations

function IntegrationCard({ name, kind, status, lastSync, fields, color = "var(--accent)", logo }) {
  const connected = status === "connected";
  return (
    <div className="zr-card" style={{
      padding: 18,
      borderColor: connected ? "var(--border-strong)" : "var(--border)",
      background: connected ? "var(--surface-2)" : "var(--surface)",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `color-mix(in oklab, ${color}, transparent 82%)`,
          color, display: "grid", placeItems: "center",
          fontFamily: "Instrument Serif, serif", fontSize: 20,
          border: `1px solid color-mix(in oklab, ${color}, transparent 70%)`,
        }}>{logo}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: "var(--text)" }}>{name}</div>
          <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{kind}</div>
        </div>
        {connected ? (
          <span className="zr-pill positive" style={{ fontSize: 10 }}>
            <span className="dot"></span>Connected
          </span>
        ) : (
          <span className="zr-pill" style={{ fontSize: 10, color: "var(--text-mute)" }}>
            <span className="dot" style={{ background: "var(--text-faint)" }}></span>Available
          </span>
        )}
      </div>
      {fields && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {fields.map((f, i) => (
            <span key={i} className="zr-pill" style={{ fontSize: 10 }}>{f}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, color: "var(--text-mute)" }} className="zr-mono">
          {connected ? `synced ${lastSync}` : "—"}
        </div>
        <button className={"zr-btn sm" + (connected ? "" : " primary")}>
          {connected ? "Manage" : "Connect"}
        </button>
      </div>
    </div>
  );
}

function IntegrationsArtboard() {
  return (
    <Shell active="links" crumbs={["Integrations"]}>
      <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 22 }}>
        <div>
          <div className="zr-eyebrow" style={{ marginBottom: 8 }}>11 connections · 4 active streams</div>
          <h1 className="zr-serif" style={{ fontSize: 36, lineHeight: 1.1, maxWidth: 660 }}>
            The signals your agents listen to.
          </h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="zr-btn">Data export</button>
          <button className="zr-btn primary">{I.plus} Add a connection</button>
        </div>
      </div>

      <div style={{
        padding: 16, borderRadius: 12,
        border: "1px solid var(--border)",
        background: "linear-gradient(120deg, rgba(232,181,122,.04), transparent 60%), var(--surface-2)",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24,
        marginBottom: 22,
      }}>
        {[
          { l: "Events ingested · 24h", v: "1,284" },
          { l: "Inference budget",       v: "37% used" },
          { l: "Storage",                v: "212 MB" },
          { l: "Latency · p95",          v: "412ms" },
        ].map((s, i) => (
          <div key={i}>
            <div className="zr-eyebrow">{s.l}</div>
            <div className="zr-serif" style={{ fontSize: 26 }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 8 }}>
        <h3 className="zr-serif" style={{ fontSize: 22 }}>Wearables &amp; health</h3>
        <p style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 4 }}>The body-signal layer.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 22 }}>
        <IntegrationCard name="Oura Ring" kind="Sleep, HRV, temp · primary"
          status="connected" lastSync="3m ago" logo="O" color="var(--ag-lyra)"
          fields={["Sleep stages","HRV","RHR","Temp","Activity"]}/>
        <IntegrationCard name="Apple Health" kind="Aggregated phone signals"
          status="connected" lastSync="just now" logo="" color="var(--ag-sage)"
          fields={["Steps","Mindful min","ECG","Cycle"]}/>
        <IntegrationCard name="Whoop 5.0" kind="Strain · alternative"
          status="available" logo="W" color="var(--ag-atlas)"
          fields={["Strain","Recovery","Sleep"]}/>
        <IntegrationCard name="Withings" kind="Body composition"
          status="connected" lastSync="2h ago" logo="W" color="var(--ag-fern)"
          fields={["Weight","Fat %","BP"]}/>
        <IntegrationCard name="Strava" kind="Workouts"
          status="connected" lastSync="yesterday" logo="S" color="var(--ag-atlas)"
          fields={["Runs","Rides","Power"]}/>
        <IntegrationCard name="Continuous glucose" kind="Stelo / Levels"
          status="available" logo="G" color="var(--ag-fern)"/>
      </div>

      <div style={{ marginBottom: 8 }}>
        <h3 className="zr-serif" style={{ fontSize: 22 }}>Work &amp; calendar</h3>
        <p style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 4 }}>So Orchid and Echo can choreograph.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 22 }}>
        <IntegrationCard name="Google Calendar" kind="Primary · personal + work"
          status="connected" lastSync="live" logo="G" color="var(--ag-orchid)"
          fields={["Events","Conflicts","Travel time","Quiet blocks"]}/>
        <IntegrationCard name="Slack" kind="Echo manages your nudges"
          status="connected" lastSync="live" logo="#" color="var(--ag-echo)"
          fields={["Status","DND","Mentions"]}/>
        <IntegrationCard name="Linear" kind="Work pace signals"
          status="connected" lastSync="6m ago" logo="L" color="var(--ag-orchid)"
          fields={["Issues closed","Velocity"]}/>
        <IntegrationCard name="Notion" kind="Daily notes inflow"
          status="available" logo="N" color="var(--text-2)"/>
        <IntegrationCard name="Gmail" kind="Last-resort signal · read-only"
          status="available" logo="@" color="var(--ag-atlas)"/>
        <IntegrationCard name="iMessage / WhatsApp" kind="Off · we don't read these"
          status="available" logo="" color="var(--text-mute)"/>
      </div>

      <div style={{ marginBottom: 8 }}>
        <h3 className="zr-serif" style={{ fontSize: 22 }}>Environment &amp; lifestyle</h3>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 22 }}>
        <IntegrationCard name="Philips Hue" kind="Lyra dims for wind-down"
          status="connected" lastSync="live" logo="H" color="var(--ag-iris)"
          fields={["Color","Schedules"]}/>
        <IntegrationCard name="Spotify" kind="Wind-down + focus mixes"
          status="connected" lastSync="active" logo="S" color="var(--ag-sage)"
          fields={["Now playing","Playlists"]}/>
        <IntegrationCard name="Air quality" kind="Local AQI · IQAir"
          status="connected" lastSync="15m ago" logo="A" color="var(--ag-echo)"/>
        <IntegrationCard name="Weather" kind="OpenMeteo · sun + UV"
          status="connected" lastSync="just now" logo="W" color="var(--ag-orchid)"/>
        <IntegrationCard name="Cronometer" kind="Manual nutrition log"
          status="available" logo="C" color="var(--ag-fern)"/>
        <IntegrationCard name="Headspace" kind="Mindful minutes"
          status="available" logo="H" color="var(--ag-iris)"/>
      </div>

      {/* Permissions */}
      <div className="zr-card">
        <div className="zr-card-head">
          <span className="zr-card-title">Data &amp; permissions · house rules</span>
          <span className="zr-card-action">{I.info} What we store · {I.arrow}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { t: "Local-first", d: "Raw signals stay on-device when possible. Only summaries hit the cloud." },
            { t: "Per-agent scope", d: "Each agent reads only what its role requires. Audit log in Settings." },
            { t: "One-tap revoke", d: "Disconnect any source and we forget within 24 hours." },
          ].map((p, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, color: "var(--text)" }}>{p.t}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{p.d}</div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { IntegrationsArtboard });
