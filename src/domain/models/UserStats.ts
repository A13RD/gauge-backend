export interface GenreHourStat {
  genre: string;
  hours: number;
}

export interface UserStats {
  totalHours: number;
  totalReviews: number;
  hoursByGenre: GenreHourStat[];
}
