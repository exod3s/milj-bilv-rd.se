import { Star } from "lucide-react";
import { getGoogleReviews } from "@/lib/google-reviews";

export async function ReviewsSection() {
  const reviews = await getGoogleReviews();

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {reviews.map((review) => (
        <article key={`${review.authorName}-${review.relativeTimeDescription}`} className="surface border-t-4 border-t-forest-300 p-5">
          <div className="mb-4 flex gap-1 text-polish-gold" aria-label={`${review.rating} av 5 stjärnor`}>
            {Array.from({ length: review.rating }).map((_, index) => (
              <Star key={index} size={18} fill="currentColor" />
            ))}
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
