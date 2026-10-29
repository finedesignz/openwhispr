# Signed fork build (finedesignz/openwhispr)

`electron-builder.fork.json` extends the upstream `electron-builder.json` and overrides only:

- `win.azureSignOptions`: Titanium Labs LLC, Azure Trusted Signing (account `titaniumlabs-signing`, profile `TitaniumLabsLLC`).
- `publish`: GitHub `finedesignz/openwhispr`.

`appId` is unchanged (`com.gizmolabs.openwhispr`), so the installer upgrades an existing install in place and keeps user data.

## Build (Node 24)

Put `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` in the build process environment only, and use a valid `GH_TOKEN` for the sidecar downloads. The Proton Pass item `azure-trusted-signing` stores them under lowercase names, so map them explicitly in the same shell as the build. An unset variable makes signing fall back to another identity and fail with 403 Forbidden.

```powershell
$j = pass-get azure-trusted-signing | ConvertFrom-Json
$env:AZURE_TENANT_ID = $j.tenant_id; $env:AZURE_CLIENT_ID = $j.client_id; $env:AZURE_CLIENT_SECRET = $j.client_secret
npm ci
npm run prebuild:win
npm run build:renderer
npx electron-builder --win nsis --publish never --config electron-builder.fork.json
```

Output: `dist/OpenWhispr Setup <version>.exe`. Signing happens during bundling. Verify with `Get-AuthenticodeSignature` on the installer and on `dist/win-unpacked/OpenWhispr.exe` (Status Valid, CN=Titanium Labs LLC). Delete `dist/win-unpacked` after any failed signed build.

## Release

Publish to `finedesignz/openwhispr` as a non-draft release marked latest, with `latest.yml`, the installer and its `.blockmap`. Asset names must match `latest.yml`, which uses dashes (`OpenWhispr-Setup-<version>.exe`), so upload renamed copies. The app's updater reads the build-generated `app-update.yml` and checks this repo.

Note: `download:brand-fonts` needs access to a private upstream release; without it the app uses its bundled font.
