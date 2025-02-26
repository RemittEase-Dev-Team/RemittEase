<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Blog; // Import the Blog model

class BlogsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $blogs = [
            [
                'title' => 'Understanding Web3 Transactions',
                'content' => 'A deep dive into how Web3 transactions work and their impact on the future of finance.',
                'image' => 'https://imageplaceholder.net/300x200?text=Web3+Transactions',
                'user_id' => 1, // Assuming a user with ID 1 exists
                'slug' => 'understanding-web3-transactions',
                'excerpt' => 'A deep dive into Web3 transactions.',
                'tags' => 'Web3, Finance',
                'status' => 'published',
            ],
            [
                'title' => 'Remittances in the Age of Blockchain',
                'content' => 'Exploring how blockchain technology is revolutionizing remittance services globally.',
                'image' => 'https://imageplaceholder.net/300x200?text=Blockchain+Remittances',
                'user_id' => 1,
                'slug' => 'remittances-in-the-age-of-blockchain',
                'excerpt' => 'How blockchain is changing remittances.',
                'tags' => 'Blockchain, Remittances',
                'status' => 'published',
            ],
            [
                'title' => 'The Future of Decentralized Finance',
                'content' => 'An overview of decentralized finance (DeFi) and its implications for traditional banking.',
                'image' => 'https://imageplaceholder.net/300x200?text=Decentralized+Finance',
                'user_id' => 1,
                'slug' => 'the-future-of-decentralized-finance',
                'excerpt' => 'Understanding DeFi and its impact.',
                'tags' => 'DeFi, Finance',
                'status' => 'draft',
            ],
            [
                'title' => 'How RemittEase is Leading the Charge',
                'content' => 'Discover how RemittEase is leveraging Web3 technology to enhance remittance services.',
                'image' => 'https://imageplaceholder.net/300x200?text=RemittEase+Web3',
                'user_id' => 1,
                'slug' => 'how-remittEase-is-leading-the-charge',
                'excerpt' => 'RemittEase and Web3 technology.',
                'tags' => 'RemittEase, Web3',
                'status' => 'published',
            ],
        ];

        foreach ($blogs as $blog) {
            Blog::create($blog);
        }
    }
}
