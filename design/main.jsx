// Zenra — Main canvas assembly + Tweaks
// Mounts every artboard inside a design-canvas section, with light/dark + conductor variant.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "conductor": "timeline"
}/*EDITMODE-END*/;

function Themed({ theme, children }) {
  return <div data-theme={theme} style={{ width: 1440, background: "var(--bg)" }}>{children}</div>;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const variantIdx = t.conductor === "network" ? 1 : t.conductor === "calendar" ? 2 : 0;

  // Wrap each artboard in a Themed shell so the chosen mode cascades.
  const A = (Cmp, props) => (
    <Themed theme={t.theme}><Cmp {...(props||{})}/></Themed>
  );

  return (
    <>
      <DesignCanvas>
        <DCSection id="hero" title="Zenra · Health agent" subtitle="Conversation-first · icy-blue light aesthetic · 10 screens · Tweaks: theme + Conductor variant">
          <DCArtboard id="dashboard" label="01 · Home · conversational" width={1440} height={1100}>
            {A(DashboardArtboard)}
          </DCArtboard>
          <DCArtboard id="action-feed" label="02 · Action Feed" width={1440} height={1700}>
            {A(ActionFeedArtboard)}
          </DCArtboard>
          <DCArtboard id="conductor" label={`03 · Conductor — ${t.conductor}`} width={1440} height={1500}>
            {A(ConductorArtboard, { variant: variantIdx, setVariant: (i) => setTweak("conductor", ["timeline","network","calendar"][i]) })}
          </DCArtboard>
        </DCSection>

        <DCSection id="deep" title="Deep dives" subtitle="Where each agent earns trust">
          <DCArtboard id="recovery" label="04 · Recovery & Sleep" width={1440} height={1320}>
            {A(RecoveryArtboard)}
          </DCArtboard>
          <DCArtboard id="agent"    label="05 · Agent detail · Orchid" width={1440} height={1500}>
            {A(AgentArtboard)}
          </DCArtboard>
          <DCArtboard id="reflect"  label="06 · Reflection check-in"   width={1440} height={930}>
            {A(ReflectionArtboard)}
          </DCArtboard>
          <DCArtboard id="nutrition" label="07 · Nutrition plan"        width={1440} height={1120}>
            {A(NutritionArtboard)}
          </DCArtboard>
        </DCSection>

        <DCSection id="setup" title="Setup &amp; settings" subtitle="The contract between you and your agents">
          <DCArtboard id="onboarding" label="08 · Onboarding · multi-step" width={1440} height={1530}>
            {A(OnboardingArtboard)}
          </DCArtboard>
          <DCArtboard id="integrations" label="09 · Integrations" width={1440} height={1720}>
            {A(IntegrationsArtboard)}
          </DCArtboard>
          <DCArtboard id="settings" label="10 · Profile + settings" width={1440} height={2490}>
            {A(SettingsArtboard)}
          </DCArtboard>
        </DCSection>

        <DCPostIt x={40} y={20} color="butter">
          <b>Zenra</b> — a proactive personal health agent.
          Light, icy-blue palette · Instrument Serif display + Geist body.
          Conversation-first home with the orb · right-rail vitals · seven named agents kept quiet behind the scenes.
          Tweaks → theme (light/dark) + Conductor variant (Timeline · Network · Calendar).
        </DCPostIt>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance">
          <TweakRadio
            label="Theme"
            value={t.theme}
            options={["dark", "light"]}
            onChange={(v) => setTweak("theme", v)}
          />
        </TweakSection>
        <TweakSection label="Conductor view (screen 03)">
          <TweakRadio
            label="Layout"
            value={t.conductor}
            options={["timeline", "network", "calendar"]}
            onChange={(v) => setTweak("conductor", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
