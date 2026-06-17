import { Star } from "lucide-react";
import { getGoogleReviews } from "@/lib/google-reviews";

export async function ReviewsSection() {
  const reviews = await getGoogleReviews();

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {reviews.map((review) => (
        <article key={`${review.authorName}-${review.relativeTimeDescription}`} className="surface border-t-4 border-t-forest-300 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex gap-1 text-polish-gold" aria-label={`${review.rating} av 5 stjärnor`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={18}
                  fill="currentColor"
                  className={index < review.rating ? "" : "opacity-25"}
                />
              ))}
            </div>
            <span className="rounded bg-slate-50 px-2 py-1 text-xs font-black text-slate-700">
              Google
            </span>
          </div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl font-black text-forest-950">
              {review.rating}.0
            </span>
            <span className="text-xs font-black uppercase tracking-[0.12em] text-forest-700">
              Kundbetyg
            </span>
          </div>
          <p className="text-sm leading-6 text-slate-700">“{review.text}”</p>
          <div className="mt-5 border-t border-forest-100 pt-4">
            <p className="font-black text-forest-950">{review.authorName}</p>
            <p className="text-xs font-black text-forest-700">
              Google-recension, {review.relativeTimeDescription}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
