"use client"
import { useEffect, useState } from "react";

type NewsArticle = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source_id: string;
};


function MedicalResearchNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // TODO: In production, use a backend proxy to hide your API key!
    fetch(
      `https://newsdata.io/api/1/news?apikey=pub_9bdd48f140654dff9eddcdc2ed93ef7d&q=medical+research&category=health&language=en`
    )
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading news...</div>;

  return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top-left dashboard title */}
        <h1 className="text-4xl font-semibold tracking-tight text-[#222] dark:text-white mb-6 flex items-center gap-2">
        ArogyaCompass
        <span
            className="px-2.5 py-0.5 text-base font-bold transition-all duration-300"
            style={{
            background: "#22D3EE",
            color: "#232629",
            borderRadius: "0 15px 15px 0",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.5px",
            textTransform: "lowercase",
            lineHeight: "1.25",
            }}
        >
            pro
        </span>
        </h1>

        {/* News articles list */}
        <div className="space-y-6 mb-10">
            {articles.map((art) => (
            <a
                key={art.link}
                href={art.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-b border-gray-200 dark:border-gray-700 pb-4 transition hover:bg-gray-50 dark:hover:bg-[#1e1e1e] p-4 rounded-lg"
            >
                <h2 className="text-lg font-semibold mb-1 text-[#232325] dark:text-white">
                {art.title}
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {art.source_id} &bull; {new Date(art.pubDate).toLocaleString()}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {art.description}
                </p>
            </a>
            ))}

            {/* No results fallback */}
            {articles.length === 0 && !loading && (
            <div className="text-gray-500 dark:text-gray-400 text-center mt-8">
                No recent medical research news found.
            </div>
            )}
        </div>
        </div>
  );
}

export default MedicalResearchNews;
