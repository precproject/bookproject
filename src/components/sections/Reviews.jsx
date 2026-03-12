import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Reviews = () => {
  const { t } = useTranslation();

  // Note: These could also be fetched from your API/DB eventually!
  const reviews = [
    { name: "Sandeep R.", role: "Farmer & Entrepreneur", review: "हे पुस्तक वाचल्यानंतर माझ्या विचारांमध्ये खूप सकारात्मक बदल झाला आहे. खऱ्या अर्थाने चिंतामुक्तीचा मार्ग सापडला." },
    { name: "Priya D.", role: "Student", review: "The language is so simple and relatable. It feels like an elder guiding you through life's challenges." },
    { name: "Ramesh P.", role: "Businessman", review: "व्यावसायिक दृष्टिकोन कसा असावा याचे उत्तम मार्गदर्शन. प्रत्येक तरुणाने हे पुस्तक वाचायलाच हवे." },
    { name: "Anjali K.", role: "Teacher", review: "This book removes all the unnecessary clutter from your mind and helps you focus on what truly matters in daily life." },
    { name: "Vishal M.", role: "Shop Owner", review: "अत्यंत सोप्या भाषेत जीवनाचे तत्त्वज्ञान मांडले आहे. रोजच्या धकाधकीच्या जीवनात हे पुस्तक एक उत्तम मार्गदर्शक आहे." },
  ];

  const duplicatedReviews = [...reviews, ...reviews];

  const colors = [
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-violet-600",
  ];

  const ReviewCard = ({ review, index }) => (
    // UI FIX 1: Used your premium 'glass-card' class and added group-hover for a subtle interaction glow
    <div className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[400px] glass-card rounded-[2rem] p-6 md:p-8 mx-3 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl">

      <Quote className="w-8 h-8 text-amber-500/20 dark:text-amber-500/20 mb-4 transition-colors group-hover:text-amber-500/40" />

      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* UI FIX 2: Adaptive text color (slate-700 in light mode, slate-300 in dark mode) */}
      <p className="font-mukta text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-sm md:text-base">
        "{review.review}"
      </p>

      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${
            colors[index % colors.length]
          } flex items-center justify-center shadow-md`}
        >
          <span className="font-mukta text-sm font-bold text-white">
            {review.name.charAt(0)}
          </span>
        </div>

        <div>
          {/* UI FIX 3: Adaptive title and role text colors */}
          <div className="font-mukta font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">
            {review.name}
          </div>
          <div className="font-mukta text-xs text-slate-500 dark:text-slate-400 mt-0.5">{review.role}</div>
        </div>
      </div>

    </div>
  );

  return (
    <section
      id="reviews"
      // UI FIX 4: Removed hardcoded bg-[#0a0f1e] so it inherits the global light/dark background
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 px-4"
        >
          {/* UI FIX 5: Adaptive badge styling */}
          <span className="inline-block px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-mukta font-bold tracking-wide mb-6">
            {t("review.badge", "वाचकांचे मत")}
          </span>

          <h2 className="font-rozha text-4xl sm:text-5xl lg:text-6xl gold-gradient-text drop-shadow-sm dark:drop-shadow-none mb-4">
            {t("review.title", "हजारो उद्योजकांचा विश्वास")}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 font-mukta text-lg max-w-xl mx-auto">
            {t("review.subtitle", "हजारो वाचकांच्या जीवनात सकारात्मक बदल घडवणारे पुस्तक")}
          </p>
        </motion.div>

        {/* MARQUEE */}
        <div className="relative">

          {/* UI FIX 6: The fade-out edges now perfectly match the background theme variables!
              (Slate-200 for light mode, Slate-950 for dark mode) */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-r from-slate-200 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-l from-slate-200 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee mb-6" style={{ width: "max-content" }}>
            {duplicatedReviews.map((r, i) => (
              <ReviewCard key={`row1-${i}`} review={r} index={i} />
            ))}
          </div>

          <div
            className="flex animate-marquee"
            style={{
              width: "max-content",
              animationDirection: "reverse",
              animationDuration: "50s",
            }}
          >
            {[...duplicatedReviews].reverse().map((r, i) => (
              <ReviewCard key={`row2-${i}`} review={r} index={i + 100} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};