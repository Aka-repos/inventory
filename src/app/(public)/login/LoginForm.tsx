"use client";

import { useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const r = useRouter();
  const supa = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );
  const passOk = useMemo(() => pass.trim().length >= 6, [pass]);
  const canSubmit = emailOk && passOk && !loading;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null);
    setLoading(true);

    const { error } = await supa.auth.signInWithPassword({
      email,
      password: pass,
    });

    setLoading(false);

    if (error) {
      // Mensajes más amigables
      if (error.message.toLowerCase().includes("invalid login")) {
        setErr("Credenciales inválidas. Verifica tu correo y contraseña.");
      } else {
        setErr(error.message);
      }
      return;
    }

    r.replace("/(user)/orders");
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={email.length > 0 && !emailOk}
          aria-describedby="email-help"
          className={styles.input}
          placeholder="tucorreo@dominio.com"
        />
        <div id="email-help" className={styles.help}>
          {email.length > 0 && !emailOk ? "Formato de correo no válido." : " "}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Contraseña
        </label>
        <div className={styles.passwordWrap}>
          <input
            id="password"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            aria-invalid={pass.length > 0 && !passOk}
            aria-describedby="pass-help"
            className={styles.input}
            placeholder="Tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className={styles.eyeBtn}
            aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>
        <div id="pass-help" className={styles.help}>
          {pass.length > 0 && !passOk
            ? "Mínimo 6 caracteres."
            : " "}
        </div>
      </div>

      {err && (
        <p role="alert" aria-live="assertive" className={styles.error}>
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={styles.submit}
        aria-busy={loading}
      >
        {loading ? "Ingresando…" : "Entrar"}
      </button>

      <div className={styles.footerRow}>
        <a href="/recuperar" className={styles.link}>
          ¿Olvidaste tu contraseña?
        </a>
        <a href="/registro" className={styles.linkMuted}>
          Crear cuenta
        </a>
      </div>
    </form>
  );
}
