import releaseData from "../data/tool-releases.json";

export type ToolRelease = {
  name: string;
  version: string;
  date: string;
  status: string;
  releaseLabel?: string;
  changelog: string;
};

export type ToolReleaseKey = "presetMutatorFree" | "presetMutatorPro" | "waveMutator" | "patternMutator";

export const toolReleases = releaseData as Record<ToolReleaseKey, ToolRelease>;

export function displayToolReleaseVersion(release: ToolRelease) {
  return `v${release.version}${release.releaseLabel ? ` ${release.releaseLabel}` : ""}`;
}

export function toolReleaseUpdateTitle(release: ToolRelease) {
  return `${release.name}${release.releaseLabel ? ` ${release.releaseLabel}` : ""} v${release.version}`;
}
