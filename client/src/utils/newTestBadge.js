/**
 * Helper xác định 1 đề thi có hiển thị mác "New" trên thẻ list không.
 *
 * Điều kiện hiển thị:
 *   1. Đề được tạo trong vòng NEW_TEST_WINDOW_DAYS ngày qua (đảm bảo
 *      thực sự là đề mới, tránh tất cả đề cũ "thành New" cho tài khoản mới).
 *   2. User CHƯA có kết quả bài làm cho đề đó.
 *
 * Khi user làm xong → có result.testId match → mác "New" tự biến mất ở lần fetch sau.
 */
export const NEW_TEST_WINDOW_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Build Set chứa các testId mà user đã từng làm (có ít nhất 1 result).
 * Result.testId có thể là object populated hoặc string ID.
 */
export function buildDoneTestIdSet(results = []) {
  const ids = new Set();
  results.forEach((r) => {
    const tid = r.testId?._id || r.testId;
    if (tid) ids.add(String(tid));
  });
  return ids;
}

/**
 * @param {Object} test - { _id, createdAt }
 * @param {Set<string>} doneIds - output của buildDoneTestIdSet
 */
export function isNewTest(test, doneIds) {
  if (!test?.createdAt) return false;
  if (doneIds?.has?.(String(test._id))) return false;
  const age = Date.now() - new Date(test.createdAt).getTime();
  return age < NEW_TEST_WINDOW_DAYS * DAY_MS;
}
