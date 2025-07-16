import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const {
  AZURE_ORG_URL,
  AZURE_PROJECT,
  AZURE_PAT,
  PIPELINE_NAMES,
  RELEASE_BRANCH_PATTERNS,
} = process.env;

const AUTH_HEADER = {
  Authorization: "Basic " + Buffer.from(":" + AZURE_PAT).toString("base64"),
  "Content-Type": "application/json",
};

const pipelineNamesToInclude = PIPELINE_NAMES
  ? PIPELINE_NAMES.split(",").map((s) => s.trim())
  : [];

const releaseBranchPatterns = RELEASE_BRANCH_PATTERNS
  ? RELEASE_BRANCH_PATTERNS.split(",").map((s) => s.trim())
  : [];

// =======================
// 🔧 Utility Functions
// =======================

const logBuildSummary = (builds, pipelineName) => {
  const recent = builds.slice(0, 1);
  recent.forEach((build, i) => {
    console.log(`     ${build.buildNumber || build.id}`);
    console.log(`     📅 ${new Date(build.queueTime).toLocaleDateString()}`);
    console.log(`     🌿 ${build.sourceBranch}`);
    console.log(`     📊 ${build.status} (${build.result || "in progress"})`);
    console.log(`     🔗 ${build._links?.web?.href || "N/A"}\n`);
  });
};

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: AUTH_HEADER });
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
};

// ==========================
// 📦 Azure DevOps APIs
// ==========================

async function getAllPipelineDefinitions() {
  const url = `${AZURE_ORG_URL}/${AZURE_PROJECT}/_apis/pipelines?api-version=7.1-preview.1`;
  const data = await fetchJson(url);

  return data?.value?.filter((pipeline) =>
    pipelineNamesToInclude.some((name) => pipeline.name.includes(name))
  );
}

async function fetchBuildsForBranch(pipelineId, branch) {
  const encodedBranch = encodeURIComponent(`refs/heads/SNA/${branch}`);
  const url = `${AZURE_ORG_URL}/${AZURE_PROJECT}/_apis/build/builds?definitions=${pipelineId}&branchName=${encodedBranch}&$top=20&api-version=7.1`;

  try {
    const data = await fetchJson(url);
    return (
      data.value?.map((b) => ({
        ...b,
        sourceBranch: b.sourceBranch || branch,
      })) || []
    );
  } catch (err) {
    console.warn(`⚠️ Failed to fetch builds for ${branch}:`, err.message);
    return [];
  }
}

async function fetchAllMatchingBuilds(pipelineId) {
  const allBuilds = [];

  for (const branch of releaseBranchPatterns) {
    const builds = await fetchBuildsForBranch(pipelineId, branch);
    allBuilds.push(...builds);
  }

  // Fallback: fetch all and filter
  if (allBuilds.length === 0) {
    console.log("🕵️ Trying fallback to filter all builds by branch pattern...");
    const url = `${AZURE_ORG_URL}/${AZURE_PROJECT}/_apis/build/builds?definitions=${pipelineId}&$top=50&api-version=7.1`;

    try {
      const data = await fetchJson(url);
      const builds = data.value.filter((b) =>
        (b.sourceBranch || "").toLowerCase().includes("release-sprint-2025-19")
      );
      allBuilds.push(...builds);
    } catch (err) {
      console.error("❌ Fallback failed:", err.message);
    }
  }

  // Dedup + sort
  const unique = Array.from(
    new Map(allBuilds.map((b) => [b.id, b])).values()
  ).sort(
    (a, b) => new Date(b.queueTime).getTime() - new Date(a.queueTime).getTime()
  );
  return unique;
}

// ==========================
// 🚀 Main Execution Flow
// ==========================

async function processAllPipelines() {
  try {
    const pipelines = await getAllPipelineDefinitions();
    if (!pipelines || pipelines.length === 0) {
      console.error("❌ No matching pipelines found.");
      return;
    }

    console.log(`🔍 Found ${pipelines.length} pipelines to scan.\n`);

    for (const pipeline of pipelines) {
      console.log(`📌 ${pipeline.name}`);
      const builds = await fetchAllMatchingBuilds(pipeline.id);
      logBuildSummary(builds, pipeline.name);
    }
  } catch (err) {
    console.error("❌ Error processing pipelines:", err.message);
  }
}

processAllPipelines();

 