export type GoogleReview = {
  authorName: string;
  rating: number;
  relativeTimeDescription: string;
  text: string;
};

export async function getGoogleReviews(): Promise<GoogleReview[]> {
  // Future Google Places integration:
  // Use a Places API key and place_id to fetch real rating and review data.
  // Google Places place details can return rating, user_ratings_total and reviews.
  return [
    {
      authorName: "Anna L.",
      rating: 5,
      relativeTimeDescription: "för 2 veckor sedan",
      text: "Bilen kändes som ny igen. Snabb återkoppling och väldigt noggrant jobb."
    },
    {
      authorName: "Erik N.",
      rating: 5,
      relativeTimeDescription: "för 1 månad sedan",
      text: "Tydliga priser, bra service och riktigt fin finish efter poleringen."
    },
    {
      authorName: "Mikael S.",
      rating: 5,
      relativeTimeDescription: "för 2 månader sedan",
      text: "Smidig bokning och trevligt bemötande. Rekommenderas varmt."
    }
  ];
}
