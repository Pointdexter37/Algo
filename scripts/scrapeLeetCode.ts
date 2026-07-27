import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql"
const DEFAULT_BATCH_SIZE = 50
const DEFAULT_TARGET_COUNT = 150

// GraphQL query to fetch the list of problems
const PROBLEMSET_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        frontendQuestionId: questionFrontendId
        title
        titleSlug
        difficulty
        topicTags {
          name
        }
        isPaidOnly
      }
    }
  }
`

type LeetCodeQuestion = {
  frontendQuestionId: string
  title: string
  titleSlug: string
  difficulty: "Easy" | "Medium" | "Hard" | string
  topicTags: Array<{ name: string }>
  isPaidOnly: boolean
}

async function fetchLeetCodeProblems(limit = DEFAULT_BATCH_SIZE, skip = 0) {
  const response = await fetch(LEETCODE_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: PROBLEMSET_QUERY,
      variables: {
        categorySlug: "",
        skip,
        limit,
        filters: {},
      }
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch from LeetCode API: ${response.statusText}`)
  }

  const data = (await response.json()) as {
    data?: { problemsetQuestionList?: { questions?: LeetCodeQuestion[] } }
    errors?: Array<{ message: string }>
  }

  if (data.errors?.length) {
    throw new Error(data.errors[0]?.message ?? "Unknown LeetCode API error")
  }

  return data.data?.problemsetQuestionList?.questions ?? []
}

function normalizeTopicTags(topicTags: Array<{ name: string }> | undefined) {
  return (topicTags ?? [])
    .map((tag) => tag.name.trim())
    .filter(Boolean)
    .join(", ")
}

async function seedProblems() {
  console.log("Fetching problems from LeetCode...")

  try {
    const questions: LeetCodeQuestion[] = []
    const seenIds = new Set<string>()

    for (let skip = 0; questions.length < DEFAULT_TARGET_COUNT; skip += DEFAULT_BATCH_SIZE) {
      const batch = await fetchLeetCodeProblems(DEFAULT_BATCH_SIZE, skip)
      if (batch.length === 0) {
        break
      }

      for (const question of batch) {
        if (seenIds.has(question.frontendQuestionId)) {
          continue
        }

        seenIds.add(question.frontendQuestionId)
        questions.push(question)

        if (questions.length >= DEFAULT_TARGET_COUNT) {
          break
        }
      }
    }

    console.log(`Successfully fetched ${questions.length} problems. Saving to database...`)

    let processedCount = 0

    for (const q of questions) {
      const leetcodeId = Number.parseInt(q.frontendQuestionId, 10)
      if (Number.isNaN(leetcodeId)) {
        continue
      }

      const topicTagsStr = normalizeTopicTags(q.topicTags)

      // Use upsert so we don't crash if the problem already exists
      await prisma.problem.upsert({
        where: { leetcodeId },
        update: {
          title: q.title,
          difficulty: q.difficulty,
          topicTags: topicTagsStr,
          url: `https://leetcode.com/problems/${q.titleSlug}/`,
          isPremium: q.isPaidOnly,
        },
        create: {
          leetcodeId,
          title: q.title,
          difficulty: q.difficulty,
          topicTags: topicTagsStr,
          url: `https://leetcode.com/problems/${q.titleSlug}/`,
          isPremium: q.isPaidOnly,
        },
      })
      processedCount += 1
    }

    console.log(`✅ Seeding complete! Processed ${processedCount} problems.`)
  } catch (error) {
    console.error("Error seeding problems:", error)
  } finally {
    await prisma.$disconnect()
  }
}

seedProblems()
