export type CuratedTrackSeed = {
  slug: string
  title: string
  description: string
  sortOrder: number
  problemTitles: string[]
}

function uniqueProblemTitles(titles: readonly string[]) {
  return Array.from(new Map(titles.map((title) => [normalizeProblemTitle(title), title])).values())
}

const STRIVER_A_TO_Z_TITLES = [
  "Pascal's Triangle",
  "Next Permutation",
  "Set Matrix Zeroes",
  "Rotate Image",
  "Spiral Matrix",
  "Subarray Sum Equals K",
  "Majority Element",
  "Majority Element II",
  "Best Time to Buy and Sell Stock",
  "Best Time to Buy and Sell Stock II",
  "Two Sum",
  "Two Sum II - Input Array Is Sorted",
  "3Sum",
  "4Sum",
  "Longest Consecutive Sequence",
  "Maximum Subarray",
  "Maximum Product Subarray",
  "Product of Array Except Self",
  "Merge Intervals",
  "Insert Interval",
  "Non-overlapping Intervals",
  "Merge Two Sorted Lists",
  "Reverse Linked List",
  "Linked List Cycle",
  "Remove Nth Node From End of List",
  "Add Two Numbers",
  "Find the Duplicate Number",
  "Search in Rotated Sorted Array",
  "Find Minimum in Rotated Sorted Array",
  "Koko Eating Bananas",
  "Trapping Rain Water",
  "House Robber",
  "House Robber II",
  "Longest Palindromic Substring",
  "Longest Common Subsequence",
  "Longest Increasing Subsequence",
  "Partition Equal Subset Sum",
  "Decode Ways",
  "Unique Paths",
  "Number of Islands",
  "Flood Fill",
  "Rotting Oranges",
  "Clone Graph",
  "Course Schedule",
  "Course Schedule II",
  "Word Search",
  "Word Ladder",
  "Binary Tree Level Order Traversal",
  "Binary Tree Right Side View",
  "Balanced Binary Tree",
  "Diameter of Binary Tree",
  "Maximum Depth of Binary Tree",
  "Validate Binary Search Tree",
] as const

const SDE_SHEET_TITLES = [
  "Two Sum",
  "Best Time to Buy and Sell Stock",
  "Contains Duplicate",
  "Maximum Subarray",
  "Maximum Product Subarray",
  "Product of Array Except Self",
  "Find Minimum in Rotated Sorted Array",
  "Search in Rotated Sorted Array",
  "3Sum",
  "Merge Intervals",
  "Insert Interval",
  "Merge Two Sorted Lists",
  "Reverse Linked List",
  "Remove Nth Node From End of List",
  "Linked List Cycle",
  "Climbing Stairs",
  "Coin Change",
  "House Robber",
  "Number of Islands",
  "Clone Graph",
  "Course Schedule",
  "Word Search",
  "Binary Tree Level Order Traversal",
  "Maximum Depth of Binary Tree",
  "Balanced Binary Tree",
  "Diameter of Binary Tree",
  "Validate Binary Search Tree",
  "Kth Smallest Element in a BST",
  "Binary Tree Right Side View",
  "Longest Common Subsequence",
  "Longest Increasing Subsequence",
  "Partition Equal Subset Sum",
  "Subarray Sum Equals K",
  "Majority Element",
  "Set Matrix Zeroes",
  "Rotate Image",
  "Spiral Matrix",
  "Pascal's Triangle",
  "Next Permutation",
  "Longest Consecutive Sequence",
  "Search a 2D Matrix",
  "Top K Frequent Elements",
  "Kth Largest Element in an Array",
  "Trapping Rain Water",
  "Decode Ways",
  "Unique Paths",
  "Word Break",
] as const

const CANONICAL_BLIND_75_TITLES = 'Contains Duplicate|Valid Anagram|Two Sum|Group Anagrams|Top K Frequent Elements|Encode and Decode Strings|Product of Array Except Self|Longest Consecutive Sequence|Valid Palindrome|3Sum|Container With Most Water|Best Time to Buy And Sell Stock|Longest Substring Without Repeating Characters|Longest Repeating Character Replacement|Minimum Window Substring|Valid Parentheses|Find Minimum In Rotated Sorted Array|Search In Rotated Sorted Array|Reverse Linked List|Merge Two Sorted Lists|Linked List Cycle|Reorder List|Remove Nth Node From End of List|Merge K Sorted Lists|Invert Binary Tree|Maximum Depth of Binary Tree|Same Tree|Subtree of Another Tree|Lowest Common Ancestor of a Binary Search Tree|Binary Tree Level Order Traversal|Validate Binary Search Tree|Kth Smallest Element In a Bst|Construct Binary Tree From Preorder And Inorder Traversal|Binary Tree Maximum Path Sum|Serialize And Deserialize Binary Tree|Find Median From Data Stream|Combination Sum|Word Search|Implement Trie Prefix Tree|Design Add And Search Words Data Structure|Word Search II|Number of Islands|Clone Graph|Pacific Atlantic Water Flow|Course Schedule|Graph Valid Tree|Number of Connected Components In An Undirected Graph|Alien Dictionary|Climbing Stairs|House Robber|House Robber II|Longest Palindromic Substring|Palindromic Substrings|Decode Ways|Coin Change|Maximum Product Subarray|Word Break|Longest Increasing Subsequence|Unique Paths|Longest Common Subsequence|Maximum Subarray|Jump Game|Insert Interval|Merge Intervals|Non Overlapping Intervals|Meeting Rooms|Meeting Rooms II|Rotate Image|Spiral Matrix|Set Matrix Zeroes|Number of 1 Bits|Counting Bits|Reverse Bits|Missing Number|Sum of Two Integers'.split("|")

const CANONICAL_NEETCODE_150_TITLES = 'Contains Duplicate|Valid Anagram|Two Sum|Group Anagrams|Top K Frequent Elements|Encode and Decode Strings|Product of Array Except Self|Valid Sudoku|Longest Consecutive Sequence|Valid Palindrome|Two Sum II Input Array Is Sorted|3Sum|Container With Most Water|Trapping Rain Water|Best Time to Buy And Sell Stock|Longest Substring Without Repeating Characters|Longest Repeating Character Replacement|Permutation In String|Minimum Window Substring|Sliding Window Maximum|Valid Parentheses|Min Stack|Evaluate Reverse Polish Notation|Daily Temperatures|Car Fleet|Largest Rectangle In Histogram|Binary Search|Search a 2D Matrix|Koko Eating Bananas|Find Minimum In Rotated Sorted Array|Search In Rotated Sorted Array|Time Based Key Value Store|Median of Two Sorted Arrays|Reverse Linked List|Merge Two Sorted Lists|Linked List Cycle|Reorder List|Remove Nth Node From End of List|Copy List With Random Pointer|Add Two Numbers|Find The Duplicate Number|LRU Cache|Merge K Sorted Lists|Reverse Nodes In K Group|Invert Binary Tree|Maximum Depth of Binary Tree|Diameter of Binary Tree|Balanced Binary Tree|Same Tree|Subtree of Another Tree|Lowest Common Ancestor of a Binary Search Tree|Binary Tree Level Order Traversal|Binary Tree Right Side View|Count Good Nodes In Binary Tree|Validate Binary Search Tree|Kth Smallest Element In a Bst|Construct Binary Tree From Preorder And Inorder Traversal|Binary Tree Maximum Path Sum|Serialize And Deserialize Binary Tree|Kth Largest Element In a Stream|Last Stone Weight|K Closest Points to Origin|Kth Largest Element In An Array|Task Scheduler|Design Twitter|Find Median From Data Stream|Subsets|Combination Sum|Combination Sum II|Permutations|Subsets II|Generate Parentheses|Word Search|Palindrome Partitioning|Letter Combinations of a Phone Number|N Queens|Implement Trie Prefix Tree|Design Add And Search Words Data Structure|Word Search II|Number of Islands|Max Area of Island|Clone Graph|Walls And Gates|Rotting Oranges|Pacific Atlantic Water Flow|Surrounded Regions|Course Schedule|Course Schedule II|Graph Valid Tree|Number of Connected Components In An Undirected Graph|Redundant Connection|Word Ladder|Network Delay Time|Reconstruct Itinerary|Min Cost to Connect All Points|Swim In Rising Water|Alien Dictionary|Cheapest Flights Within K Stops|Climbing Stairs|Min Cost Climbing Stairs|House Robber|House Robber II|Longest Palindromic Substring|Palindromic Substrings|Decode Ways|Coin Change|Maximum Product Subarray|Word Break|Longest Increasing Subsequence|Partition Equal Subset Sum|Unique Paths|Longest Common Subsequence|Best Time to Buy And Sell Stock With Cooldown|Coin Change II|Target Sum|Interleaving String|Longest Increasing Path In a Matrix|Distinct Subsequences|Edit Distance|Burst Balloons|Regular Expression Matching|Maximum Subarray|Jump Game|Jump Game II|Gas Station|Hand of Straights|Merge Triplets to Form Target Triplet|Partition Labels|Valid Parenthesis String|Insert Interval|Merge Intervals|Non Overlapping Intervals|Meeting Rooms|Meeting Rooms II|Minimum Interval to Include Each Query|Rotate Image|Spiral Matrix|Set Matrix Zeroes|Happy Number|Plus One|Pow(x, n)|Multiply Strings|Detect Squares|Single Number|Number of 1 Bits|Counting Bits|Reverse Bits|Missing Number|Sum of Two Integers|Reverse Integer'.split("|")

const CANONICAL_NEETCODE_250_TITLES = 'Concatenation of Array|Contains Duplicate|Valid Anagram|Two Sum|Longest Common Prefix|Group Anagrams|Remove Element|Majority Element|Design HashSet|Design HashMap|Sort an Array|Sort Colors|Top K Frequent Elements|Encode and Decode Strings|Range Sum Query 2D Immutable|Product of Array Except Self|Valid Sudoku|Longest Consecutive Sequence|Best Time to Buy And Sell Stock II|Majority Element II|Subarray Sum Equals K|First Missing Positive|Reverse String|Valid Palindrome|Valid Palindrome II|Merge Strings Alternately|Merge Sorted Array|Remove Duplicates From Sorted Array|Two Sum II Input Array Is Sorted|3Sum|4Sum|Rotate Array|Container With Most Water|Boats to Save People|Trapping Rain Water|Contains Duplicate II|Best Time to Buy And Sell Stock|Longest Substring Without Repeating Characters|Longest Repeating Character Replacement|Permutation In String|Minimum Size Subarray Sum|Find K Closest Elements|Minimum Window Substring|Sliding Window Maximum|Baseball Game|Valid Parentheses|Implement Stack Using Queues|Implement Queue using Stacks|Min Stack|Evaluate Reverse Polish Notation|Asteroid Collision|Daily Temperatures|Online Stock Span|Car Fleet|Simplify Path|Decode String|Maximum Frequency Stack|Largest Rectangle In Histogram|Binary Search|Search Insert Position|Guess Number Higher Or Lower|Sqrt(x)|Search a 2D Matrix|Koko Eating Bananas|Capacity to Ship Packages Within D Days|Find Minimum In Rotated Sorted Array|Search In Rotated Sorted Array|Search In Rotated Sorted Array II|Time Based Key Value Store|Split Array Largest Sum|Median of Two Sorted Arrays|Find in Mountain Array|Reverse Linked List|Merge Two Sorted Lists|Linked List Cycle|Reorder List|Remove Nth Node From End of List|Copy List With Random Pointer|Add Two Numbers|Find The Duplicate Number|Reverse Linked List II|Design Circular Queue|LRU Cache|LFU Cache|Merge K Sorted Lists|Reverse Nodes In K Group|Binary Tree Inorder Traversal|Binary Tree Preorder Traversal|Binary Tree Postorder Traversal|Invert Binary Tree|Maximum Depth of Binary Tree|Diameter of Binary Tree|Balanced Binary Tree|Same Tree|Subtree of Another Tree|Lowest Common Ancestor of a Binary Search Tree|Insert into a Binary Search Tree|Delete Node in a BST|Binary Tree Level Order Traversal|Binary Tree Right Side View|Construct Quad Tree|Count Good Nodes In Binary Tree|Validate Binary Search Tree|Kth Smallest Element In a Bst|Construct Binary Tree From Preorder And Inorder Traversal|House Robber III|Delete Leaves With a Given Value|Binary Tree Maximum Path Sum|Serialize And Deserialize Binary Tree|Kth Largest Element In a Stream|Last Stone Weight|K Closest Points to Origin|Kth Largest Element In An Array|Task Scheduler|Design Twitter|Single Threaded CPU|Reorganize String|Longest Happy String|Car Pooling|Find Median From Data Stream|IPO|Sum of All Subset XOR Totals|Subsets|Combination Sum|Combination Sum II|Combinations|Permutations|Subsets II|Permutations II|Generate Parentheses|Word Search|Palindrome Partitioning|Letter Combinations of a Phone Number|Matchsticks to Square|Partition to K Equal Sum Subsets|N Queens|N Queens II|Word Break II|Implement Trie Prefix Tree|Design Add And Search Words Data Structure|Extra Characters in a String|Word Search II|Island Perimeter|Verifying An Alien Dictionary|Find the Town Judge|Number of Islands|Max Area of Island|Clone Graph|Walls And Gates|Rotting Oranges|Pacific Atlantic Water Flow|Surrounded Regions|Open The Lock|Course Schedule|Course Schedule II|Graph Valid Tree|Course Schedule IV|Number of Connected Components In An Undirected Graph|Redundant Connection|Accounts Merge|Evaluate Division|Minimum Height Trees|Word Ladder|Path with Minimum Effort|Network Delay Time|Reconstruct Itinerary|Min Cost to Connect All Points|Swim In Rising Water|Alien Dictionary|Cheapest Flights Within K Stops|Find Critical and Pseudo Critical Edges in Minimum Spanning Tree|Build a Matrix With Conditions|Greatest Common Divisor Traversal|Climbing Stairs|Min Cost Climbing Stairs|N-th Tribonacci Number|House Robber|House Robber II|Longest Palindromic Substring|Palindromic Substrings|Decode Ways|Coin Change|Maximum Product Subarray|Word Break|Longest Increasing Subsequence|Partition Equal Subset Sum|Combination Sum IV|Perfect Squares|Integer Break|Stone Game III|Unique Paths|Unique Paths II|Minimum Path Sum|Longest Common Subsequence|Last Stone Weight II|Best Time to Buy And Sell Stock With Cooldown|Coin Change II|Target Sum|Interleaving String|Stone Game|Stone Game II|Longest Increasing Path In a Matrix|Distinct Subsequences|Edit Distance|Burst Balloons|Regular Expression Matching|Lemonade Change|Maximum Subarray|Maximum Sum Circular Subarray|Longest Turbulent Subarray|Jump Game|Jump Game II|Jump Game VII|Gas Station|Hand of Straights|Dota2 Senate|Merge Triplets to Form Target Triplet|Partition Labels|Valid Parenthesis String|Candy|Insert Interval|Merge Intervals|Non Overlapping Intervals|Meeting Rooms|Meeting Rooms II|Meeting Rooms III|Minimum Interval to Include Each Query|Excel Sheet Column Title|Greatest Common Divisor of Strings|Insert Greatest Common Divisors in Linked List|Transpose Matrix|Rotate Image|Spiral Matrix|Set Matrix Zeroes|Happy Number|Plus One|Roman to Integer|Pow(x, n)|Multiply Strings|Detect Squares|Single Number|Number of 1 Bits|Counting Bits|Add Binary|Reverse Bits|Missing Number|Sum of Two Integers|Reverse Integer|Bitwise AND of Numbers Range|Minimum Array End'.split("|")

export const CURATED_TRACKS: CuratedTrackSeed[] = [
  {
    slug: "blind-75",
    title: "Blind 75",
    description: "The highest-signal starter list for interview prep.",
    sortOrder: 0,
    problemTitles: CANONICAL_BLIND_75_TITLES,
  },
  {
    slug: "neetcode-150",
    title: "NeetCode 150",
    description: "A broader practice path that expands on Blind 75.",
    sortOrder: 1,
    problemTitles: CANONICAL_NEETCODE_150_TITLES,
  },
  {
    slug: "neetcode-250",
    title: "NeetCode 250",
    description: "A deeper interview set that covers more patterns and edge cases.",
    sortOrder: 2,
    problemTitles: CANONICAL_NEETCODE_250_TITLES,
  },
  {
    slug: "striver-a-to-z",
    title: "Striver A to Z",
    description: "A structured problem path that moves from basics to advanced patterns.",
    sortOrder: 3,
    problemTitles: uniqueProblemTitles(STRIVER_A_TO_Z_TITLES),
  },
  {
    slug: "sde-sheet",
    title: "SDE Sheet",
    description: "A compact revision sheet built around high-frequency interview problems.",
    sortOrder: 4,
    problemTitles: uniqueProblemTitles(SDE_SHEET_TITLES),
  },
]

export function normalizeProblemTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}
