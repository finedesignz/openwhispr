import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { InfoBox } from "../ui/InfoBox";
import { SettingsPanel, SettingsPanelRow, SettingsRow } from "../ui/SettingsSection";
import { useTitaniumAuth } from "../../hooks/useTitaniumAuth";

// Account section when the fork runs on Titanium: sign in through the Titanium hosted
// login, see the license this app holds, sign out.
const KNOWN_REASONS = new Set(["no_license", "expired", "audience_mismatch", "unconfigured"]);
const KNOWN_ERRORS = new Set([
  "state_mismatch",
  "no_pending_sign_in",
  "exchange_unreachable",
  "invalid_code_verifier",
  "token_not_found",
  "app_mismatch",
]);

export default function TitaniumAccountSection() {
  const { t, i18n } = useTranslation();
  const auth = useTitaniumAuth();

  const expiry = auth.license?.expiry
    ? new Date(auth.license.expiry).toLocaleDateString(i18n.language, { dateStyle: "medium" })
    : null;
  const reason = auth.reason && KNOWN_REASONS.has(auth.reason) ? auth.reason : "invalid";
  const error = auth.error
    ? t(`titaniumAccount.errors.${KNOWN_ERRORS.has(auth.error) ? auth.error : "generic"}`)
    : null;

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-base font-normal! tracking-normal! text-foreground">
          {t("titaniumAccount.title")}
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{t("titaniumAccount.description")}</p>
      </div>

      {error && (
        <InfoBox variant="warning" className="mb-6 p-3">
          <p className="text-[13px] text-foreground">{error}</p>
        </InfoBox>
      )}

      <SettingsPanel className="mb-6">
        {auth.signedIn ? (
          <>
            <SettingsPanelRow>
              <SettingsRow label={auth.email ?? ""} description={t("titaniumAccount.signedInAs")}>
                <Button variant="outline" size="sm" onClick={() => void auth.signOut()}>
                  {t("titaniumAccount.signOut")}
                </Button>
              </SettingsRow>
            </SettingsPanelRow>
            <SettingsPanelRow>
              <SettingsRow
                label={t("titaniumAccount.license.label")}
                description={
                  auth.licensed
                    ? expiry
                      ? t("titaniumAccount.license.activeUntil", { date: expiry })
                      : t("titaniumAccount.license.active")
                    : t(`titaniumAccount.license.reasons.${reason}`)
                }
              >
                <span
                  className={
                    auth.licensed ? "text-[13px] text-success" : "text-[13px] text-muted-foreground"
                  }
                >
                  {auth.licensed
                    ? t("titaniumAccount.license.statusActive")
                    : t("titaniumAccount.license.statusNone")}
                </span>
              </SettingsRow>
            </SettingsPanelRow>
          </>
        ) : (
          <SettingsPanelRow>
            <SettingsRow
              label={t("titaniumAccount.signedOut.label")}
              description={
                auth.pending
                  ? t("titaniumAccount.signedOut.pending")
                  : t("titaniumAccount.signedOut.description")
              }
            >
              <Button size="sm" disabled={!auth.configured} onClick={() => void auth.signIn()}>
                {auth.pending ? t("titaniumAccount.signInAgain") : t("titaniumAccount.signIn")}
              </Button>
            </SettingsRow>
          </SettingsPanelRow>
        )}
      </SettingsPanel>
    </div>
  );
}
