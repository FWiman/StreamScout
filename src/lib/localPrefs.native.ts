// iOS and Android: give the app a localStorage backed by expo-sqlite.
import "expo-sqlite/localStorage/install";

export { readPref, writePref } from "./localPrefsCore";
