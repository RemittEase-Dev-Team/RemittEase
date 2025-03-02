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
                'content' => 'Web3 transactions represent a paradigm shift in how digital transactions are conducted, offering enhanced security, transparency, and efficiency. This article explores the underlying technology of Web3, including blockchain and smart contracts, and how they facilitate decentralized transactions. We will delve into the benefits and challenges of Web3 transactions, their potential to disrupt traditional financial systems, and real-world applications that are already making an impact. By the end of this read, you will have a comprehensive understanding of how Web3 transactions are shaping the future of finance.',
                'image' => 'https://imageplaceholder.net/300x200?text=Web3+Transactions',
                'user_id' => 1, // posted by Admin
                'slug' => 'understanding-web3-transactions',
                'excerpt' => 'A comprehensive exploration of Web3 transactions and their future impact.',
                'tags' => 'Web3, Finance',
                'status' => 'published',
            ],
            [
                'title' => 'Remittances in the Age of Blockchain',
                'content' => 'Blockchain technology is revolutionizing the remittance industry by providing faster, cheaper, and more secure ways to transfer money across borders. This article examines the traditional remittance process and highlights the inefficiencies that blockchain aims to address. We will explore various blockchain-based remittance platforms, their operational mechanisms, and the benefits they offer to users. Additionally, we will discuss the regulatory challenges and the future outlook of blockchain in the remittance sector. By the end of this article, readers will gain insights into how blockchain is transforming global remittance services.',
                'image' => 'https://imageplaceholder.net/300x200?text=Blockchain+Remittances',
                'user_id' => 1,
                'slug' => 'remittances-in-the-age-of-blockchain',
                'excerpt' => 'Exploring the transformative impact of blockchain on remittance services.',
                'tags' => 'Blockchain, Remittances',
                'status' => 'published',
            ],
            [
                'title' => 'The Future of Decentralized Finance',
                'content' => 'Decentralized Finance (DeFi) is reshaping the financial landscape by offering open, permissionless, and borderless financial services. This article provides an in-depth analysis of DeFi, its core components such as decentralized exchanges, lending platforms, and stablecoins, and how they differ from traditional financial systems. We will explore the advantages of DeFi, including increased accessibility and reduced costs, as well as the risks and challenges it faces. The article will also highlight key DeFi projects and their impact on the financial industry. By the end, readers will understand the potential of DeFi to revolutionize finance.',
                'image' => 'https://imageplaceholder.net/300x200?text=Decentralized+Finance',
                'user_id' => 1,
                'slug' => 'the-future-of-decentralized-finance',
                'excerpt' => 'An in-depth look at DeFi and its potential to revolutionize finance.',
                'tags' => 'DeFi, Finance',
                'status' => 'draft',
            ],
            [
                'title' => 'How RemittEase is Leading the Charge',
                'content' => 'RemittEase is at the forefront of leveraging Web3 technology to enhance remittance services, offering users a seamless and efficient way to transfer money globally. This article explores the innovative solutions provided by RemittEase, including the use of blockchain for secure transactions and smart contracts for automation. We will discuss the company\'s strategic vision, its impact on the remittance industry, and the benefits it offers to users. Additionally, we will examine case studies of successful implementations and future plans for expansion. By the end of this article, readers will understand how RemittEase is pioneering the future of remittances.',
                'image' => 'https://imageplaceholder.net/300x200?text=RemittEase+Web3',
                'user_id' => 1,
                'slug' => 'how-remittEase-is-leading-the-charge',
                'excerpt' => 'Exploring RemittEase\'s pioneering role in Web3-powered remittances.',
                'tags' => 'RemittEase, Web3',
                'status' => 'published',
            ],
        ];

        foreach ($blogs as $blog) {
            Blog::create($blog);
        }
    }
}
