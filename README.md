
<p align="center">
  <img src="https://github.com/microhobby/vscode-android-repo/blob/main/assets/img/repotoolLogo.png?raw=true" alt="Repo Tool Logo">
</p>

This is an extension to help to work with [repo tool](https://gerrit.googlesource.com/git-repo/) XML manifest files.

These kind of files are used for AOSP (Android Open Source Project) and Yocto project repo manifests, for example.

# Features

For have the features listed below, you need to wait for the extension to finish the manifest file parsing. You can see the progress on the status bar:

![alt](https://github.com/microhobby/vscode-android-repo/blob/main/assets/img/parsingmanifest.gif?raw=true)

## Goto Include Manifest File

Press `Ctrl+Click` on hover of an `include` tag to open the included manifest file:

![alt](https://github.com/microhobby/vscode-android-repo/blob/main/assets/img/gotoincludes.gif?raw=true)

## Goto Remote Definition

Press `Ctrl+Click` on hover of a `remote` attribute from a `project` tag to go to the `remote` tag that defines it:

![alt](https://github.com/microhobby/vscode-android-repo/blob/main/assets/img/gotoremote.gif?raw=true)

# Contributions

More features are coming soon. Feel free to contribute with this project https://github.com/microhobby/vscode-android-repo
