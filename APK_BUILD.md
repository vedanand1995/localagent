
## GitHub Actions build

The repository includes `.github/workflows/build.yml`. After pushing to `main`, GitHub Actions installs the pinned dependencies, runs Expo Android prebuild, compiles the release APK, and uploads an artifact named `localagent-apk`. Open the repository's **Actions** tab, select **Build Android APK**, open the completed run, and download the artifact from the **Artifacts** section.
