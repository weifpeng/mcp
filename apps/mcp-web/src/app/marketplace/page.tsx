"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Download,
  ExternalLink,
  Github,
  Search,
  Star,
  Tag,
  User,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

// 模拟插件数据
// const MOCK_PLUGINS = [
//   {
//     id: 1,
//     name: "存储加速器",
//     description: "提供高速数据存储和检索服务，支持大文件分片上传",
//     tags: ["Storage", "Data"],
//     author: "DataTech Inc.",
//     downloads: 15234,
//     rating: 4.7,
//     imageUrl: "https://placehold.co/100x250",
//   },
//   {
//     id: 2,
//     name: "交易优化器",
//     description: "优化区块链交易，减少Gas费用，提高交易速度",
//     tags: ["Transaction", "Optimization"],
//     author: "BlockOpt Solutions",
//     downloads: 8765,
//     rating: 4.5,
//     imageUrl: "https://placehold.co/100x250",
//   },
//   {
//     id: 3,
//     name: "多链钱包连接器",
//     description: "一键连接多个区块链网络的钱包，支持跨链资产管理",
//     tags: ["Wallet", "Transaction"],
//     author: "ChainConnect",
//     downloads: 12089,
//     rating: 4.8,
//     imageUrl: "https://placehold.co/100x250",
//   },
//   {
//     id: 4,
//     name: "智能合约审计工具",
//     description: "自动检测智能合约中的漏洞和安全隐患",
//     tags: ["Security", "Smart Contract"],
//     author: "SecureChain",
//     downloads: 6543,
//     rating: 4.6,
//     imageUrl: "https://placehold.co/100x250",
//   },
//   {
//     id: 5,
//     name: "数据分析仪表盘",
//     description: "可视化链上数据，支持自定义数据分析和图表展示",
//     tags: ["Data", "Analytics"],
//     author: "ChainMetrics",
//     downloads: 9876,
//     rating: 4.4,
//     imageUrl: "https://placehold.co/100x250",
//   },
//   {
//     id: 6,
//     name: "NFT 创建助手",
//     description: "一站式 NFT 创建、部署和销售解决方案",
//     tags: ["NFT", "Creation"],
//     author: "NFTCreator",
//     downloads: 7654,
//     rating: 4.5,
//     imageUrl: "https://placehold.co/100x250",
//   },
//   {
//     id: 7,
//     name: "去中心化存储连接器",
//     description: "连接 IPFS、Arweave 等去中心化存储网络",
//     tags: ["Storage", "Decentralization"],
//     author: "StorageLabs",
//     downloads: 5432,
//     rating: 4.3,
//     imageUrl: "https://placehold.co/100x250",
//   },
//   {
//     id: 8,
//     name: "跨链桥接工具",
//     description: "安全高效的跨链资产转移解决方案",
//     tags: ["Transaction", "Bridge"],
//     author: "BridgeWorks",
//     downloads: 8765,
//     rating: 4.6,
//     imageUrl: "https://placehold.co/100x250",
//   },
// ];

// 定义插件类型接口
interface Plugin {
  id: number;
  name: string;
  description: string;
  tags: string[];
  author: string;
  downloads: number;
  rating: number;
  imageUrl: string;
}

const MOCK_PLUGINS: Plugin[] = [];
// 获取所有可用标签
const ALL_TAGS = [...new Set(MOCK_PLUGINS.flatMap((plugin) => plugin.tags))];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState(MOCK_PLUGINS);

  // 过滤插件
  useEffect(() => {
    let result = MOCK_PLUGINS;

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (plugin) =>
          plugin.name.toLowerCase().includes(query) ||
          plugin.description.toLowerCase().includes(query),
      );
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      result = result.filter((plugin) =>
        selectedTags.some((tag) => plugin.tags.includes(tag)),
      );
    }

    setFilteredPlugins(result);
  }, [searchQuery, selectedTags]);

  // 切换标签选择
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // 生成评分星星
  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    return (
      <div className="flex items-center">
        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  // GitHub 仓库链接
  const GITHUB_REPO_URL = "https://github.com/your-organization/mcp-plugins";

  return (
    <div className="container mx-auto   space-y-6  ">
      {/* 标签过滤区 */}
      {MOCK_PLUGINS.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4  px-4">
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search MCP..."
                className="pl-10"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => toggleTag(tag)}
              >
                {selectedTags.includes(tag) && <Tag className="h-3 w-3 mr-1" />}
                {tag}
              </Badge>
            ))}

            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </>
      )}

      {/* 插件卡片网格 */}
      {MOCK_PLUGINS.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => (
            <Card
              key={plugin.id}
              className="overflow-hidden flex flex-col group border border-slate-200 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/30 transition-all hover:shadow-md"
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
                <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <img
                    src={plugin.imageUrl}
                    alt={plugin.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                </div>
                <div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {plugin.name}
                  </CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground gap-2 flex-wrap">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{plugin.author}</span>
                    </div>
                    <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/50" />
                    <div className="flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      <span>{plugin.downloads.toLocaleString()}</span>
                    </div>
                    <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/50" />
                    {renderRatingStars(plugin.rating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-grow">
                <CardDescription className="line-clamp-2 text-sm mt-2">
                  {plugin.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 mt-2 pt-3">
                <div className="flex flex-wrap gap-2">
                  {plugin.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      onClick={() =>
                        !selectedTags.includes(tag) && toggleTag(tag)
                      }
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-md hover:bg-primary hover:text-white text-xs group-hover:bg-primary group-hover:text-white transition-all"
                >
                  Install
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4 py-12">
          <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-primary">
              No MCP Server available yet
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              The MCP Marketplace is waiting for your contributions. Be the
              first to develop and share with our community!
            </p>
            <div className="flex justify-center">
              <Button
                variant="default"
                className="gap-2"
                onClick={() =>
                  window.open(GITHUB_REPO_URL, "_blank", "noopener,noreferrer")
                }
              >
                <Github className="h-4 w-4" />
                Contribute on GitHub
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
