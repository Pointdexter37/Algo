import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql';

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
`;

async function fetchLeetCodeProblems(limit: number = 100, skip: number = 0) {
  const response = await fetch(LEETCODE_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: PROBLEMSET_QUERY,
      variables: {
        categorySlug: "",
        skip,
        limit,
        filters: {}
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from LeetCode API: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.problemsetQuestionList.questions;
}

async function seedProblems() {
  console.log('Fetching problems from LeetCode...');
  
  try {
    // For now, let's just fetch the first 150 problems to avoid overwhelming the database
    // This can be changed to fetch more in batches later.
    const questions = await fetchLeetCodeProblems(150, 0);

    console.log(`Successfully fetched ${questions.length} problems. Saving to database...`);

    let addedCount = 0;

    for (const q of questions) {
      // Convert array of tags to a comma-separated string for our database
      const topicTagsStr = q.topicTags.map((t: any) => t.name).join(', ');

      // Use upsert so we don't crash if the problem already exists
      await prisma.problem.upsert({
        where: { leetcodeId: parseInt(q.frontendQuestionId) },
        update: {
          title: q.title,
          difficulty: q.difficulty,
          topicTags: topicTagsStr,
          url: `https://leetcode.com/problems/${q.titleSlug}/`,
          isPremium: q.isPaidOnly,
        },
        create: {
          leetcodeId: parseInt(q.frontendQuestionId),
          title: q.title,
          difficulty: q.difficulty,
          topicTags: topicTagsStr,
          url: `https://leetcode.com/problems/${q.titleSlug}/`,
          isPremium: q.isPaidOnly,
        }
      });
      addedCount++;
    }

    console.log(`✅ Seeding complete! Processed ${addedCount} problems.`);
  } catch (error) {
    console.error('Error seeding problems:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProblems();
