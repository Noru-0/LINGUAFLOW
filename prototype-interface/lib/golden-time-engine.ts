export type ReviewRating = 1 | 2 | 3 | 4;
// 1: Again (Quên) | 2: Hard (Nhớ khó khăn) | 3: Good (Nhớ tốt) | 4: Easy (Nhớ ngay lập tức)

export interface MemoryState {
  memoryLevel: number; // 1 -> 5
  difficulty: number;  // 1.0 -> 10.0
  stability: number;   // Ngày (Interval cho R = 0.9)
  reps: number;
  lapses: number;
  lastReviewed: Date | null;
  goldenTime: Date;    // Timestamp thời điểm vàng tiếp theo
}

export class GoldenTimeEngine {
  public static readonly TARGET_RETENTION = 0.9; // Mục tiêu giữ 90% khả năng nhớ
  private static readonly MAX_STABILITY_MULTIPLIER = 2.5; // Giới hạn tốc độ tăng Stability tránh bùng nổ quá nhanh

  /**
   * Ánh xạ từ chỉ số Stability sang 5 Memory Levels trên UI
   */
  static calculateMemoryLevel(stability: number): number {
    if (stability < 2.0) return 1;
    if (stability < 5.0) return 2;
    if (stability < 14.0) return 3;
    if (stability < 45.0) return 4;
    return 5;
  }

  /**
   * Tính xác suất nhớ lại (Retrievability R) chính xác theo công thức R(t) = 0.9^(t/S)
   */
  static calculateRetrievability(stability: number, elapsedDays: number): number {
    if (stability <= 0) return 0;
    if (elapsedDays <= 0) return 1;
    return Math.pow(this.TARGET_RETENTION, elapsedDays / stability);
  }

  /**
   * Tính khoảng cách ngày đến "Thời điểm vàng" kế tiếp (với target = 0.9 thì Interval = S)
   */
  static getNextGoldenInterval(stability: number): number {
    const intervalDays = Math.max(
      0.1, // Tối thiểu ~2.4 giờ cho từ rất khó hoặc mới hỏng
      stability * (Math.log(this.TARGET_RETENTION) / Math.log(0.9))
    );
    return intervalDays;
  }

  /**
   * Khởi tạo trạng thái cho từ vựng mới học
   */
  static initNewWord(rating: ReviewRating, now: Date = new Date()): MemoryState {
    const initD: Record<ReviewRating, number> = { 1: 8.0, 2: 6.0, 3: 4.5, 4: 2.5 };
    const initS: Record<ReviewRating, number> = { 1: 0.3, 2: 1.0, 3: 2.5, 4: 5.0 };

    const difficulty = initD[rating];
    const stability = initS[rating];
    const intervalDays = this.getNextGoldenInterval(stability);

    const goldenTime = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    return {
      memoryLevel: this.calculateMemoryLevel(stability),
      difficulty,
      stability,
      reps: rating === 1 ? 0 : 1,
      lapses: rating === 1 ? 1 : 0,
      lastReviewed: now,
      goldenTime,
    };
  }

  /**
   * Cập nhật trạng thái DSR sau mỗi lần Review
   */
  static processReview(current: MemoryState, rating: ReviewRating, now: Date = new Date()): MemoryState {
    const last = current.lastReviewed ? new Date(current.lastReviewed) : now;
    const elapsedDays = Math.max(0, (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    const retrievability = this.calculateRetrievability(current.stability, elapsedDays);

    let newD = current.difficulty;
    let newS = current.stability;
    let lapses = current.lapses;
    let reps = current.reps;

    if (rating === 1) {
      // 1. NGƯỜI DÙNG QUÊN (FAIL / AGAIN)
      // Tăng độ khó vừa phải, giảm Stability theo tỷ lệ (lapse factor ~0.3)
      newD = Math.min(10.0, current.difficulty + 1.5);
      newS = Math.max(0.3, current.stability * 0.3);
      lapses += 1;
      reps = 0;
    } else {
      // 2. NGƯỜI DÙNG NHỚ ĐƯỢC (PASS / HARD / GOOD / EASY)
      const diffD: Record<ReviewRating, number> = { 1: 0, 2: 0.4, 3: -0.2, 4: -0.6 };
      newD = Math.max(1.0, Math.min(10.0, current.difficulty + diffD[rating]));

      // Tăng độ bền Stability: 
      // Kết hợp giữa hệ số độ khó (Difficulty Factor) và điểm thưởng khi nhớ lại ở Retrievability thấp (Retrieval Bonus)
      const difficultyFactor = (11 - newD) / 5;
      const retrievalBonus = Math.min(1.2, Math.pow(1 - retrievability, 0.5) * 1.2);
      
      const baseMultiplier = 1 + (difficultyFactor * 0.4) + retrievalBonus;
      const goodMultiplier = Math.min(this.MAX_STABILITY_MULTIPLIER, baseMultiplier);
      const easyMultiplier = Math.min(this.MAX_STABILITY_MULTIPLIER, baseMultiplier * 1.25);

      if (rating === 2) {
        // Hard: Tăng nhẹ (1.2x)
        newS = current.stability * 1.2;
      } else if (rating === 3) {
        // Good: Tăng theo multiplier chuẩn đã cap
        newS = current.stability * goodMultiplier;
      } else if (rating === 4) {
        // Easy: Tăng theo easy multiplier đã cap
        newS = current.stability * easyMultiplier;
      }

      reps += 1;
    }

    const intervalDays = this.getNextGoldenInterval(newS);
    const goldenTime = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    return {
      memoryLevel: this.calculateMemoryLevel(newS),
      difficulty: Number(newD.toFixed(2)),
      stability: Number(newS.toFixed(2)),
      reps,
      lapses,
      lastReviewed: now,
      goldenTime,
    };
  }
}
