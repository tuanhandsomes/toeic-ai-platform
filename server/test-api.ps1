# Test API end-to-end script (ASCII-only for Windows PowerShell 5.1 compat)
# Run: .\test-api.ps1
# Requires: server at localhost:5000 + seed data loaded

$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5000/api/v1'

# Edit credentials if needed
$email = 'dokhactuan2808@gmail.com'
$password = 'tuan2808'

Write-Host ""
Write-Host "=== TEST 1: Health check ===" -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri 'http://localhost:5000/health'
$health | ConvertTo-Json

Write-Host ""
Write-Host "=== TEST 2: Login ===" -ForegroundColor Cyan
try {
  $body = @{ email = $email; password = $password } | ConvertTo-Json
  $loginRes = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType 'application/json' -Body $body
  $token = $loginRes.data.accessToken
  Write-Host ("Logged in as: " + $loginRes.data.user.fullName) -ForegroundColor Green
} catch {
  Write-Host "Login failed. Check email/password in script lines 9-10." -ForegroundColor Red
  exit 1
}

$headers = @{ Authorization = "Bearer $token" }

Write-Host ""
Write-Host "=== TEST 3: GET /tests (list) ===" -ForegroundColor Cyan
$testsRes = Invoke-RestMethod -Uri "$base/tests" -Headers $headers
Write-Host ("Total tests: " + $testsRes.data.pagination.total)
$testsRes.data.items | ForEach-Object {
  $line = "  [" + $_.type + "] " + $_.title + " (" + $_.totalQuestions + " questions, " + $_.durationMinutes + " min)"
  Write-Host $line
}

Write-Host ""
Write-Host "=== TEST 4: GET /tests/:id (taking mode, correctAnswer hidden) ===" -ForegroundColor Cyan
$practicePart5 = $testsRes.data.items | Where-Object { $_.part -eq 5 } | Select-Object -First 1
if (-not $practicePart5) {
  Write-Host "No Part 5 test found" -ForegroundColor Red
  exit 1
}
$testDetail = Invoke-RestMethod -Uri ("$base/tests/" + $practicePart5._id) -Headers $headers
$firstQ = $testDetail.data.questions[0]
Write-Host ("Test: " + $testDetail.data.title)
Write-Host ("Question 1 text: " + $firstQ.content.text)
Write-Host ("  Options count: " + $firstQ.options.Count + " (Part " + $firstQ.part + ")")
$hasCorrect = ($null -ne $firstQ.correctAnswer)
$hasExplain = ($null -ne $firstQ.explanation -and $firstQ.explanation.Length -gt 0)
Write-Host ("  Has correctAnswer? " + $hasCorrect + "  (expected: False)")
Write-Host ("  Has explanation?   " + $hasExplain + "  (expected: False)")

Write-Host ""
Write-Host "=== TEST 5: POST /results (submit random answers) ===" -ForegroundColor Cyan
$random = New-Object System.Random
$answers = $testDetail.data.questions | ForEach-Object {
  $optKey = ($_.options | Get-Random).key
  @{ questionId = $_._id; selected = $optKey; timeSpentSec = $random.Next(10, 60) }
}

$submitBody = @{
  testId = $testDetail.data._id
  startedAt = (Get-Date).AddMinutes(-10).ToUniversalTime().ToString('o')
  answers = $answers
} | ConvertTo-Json -Depth 5

$submitRes = Invoke-RestMethod -Uri "$base/results" -Method POST -Headers $headers -ContentType 'application/json' -Body $submitBody
$r = $submitRes.data.result
Write-Host "Submitted result:"
Write-Host ("  Correct:    " + $r.correctCount + " / " + $r.totalQuestions)
Write-Host ("  Accuracy:   " + $r.accuracy + "%")
Write-Host ("  Listening:  " + $r.scoreListening + "  (0 for practice test = expected)")
Write-Host ("  Reading:    " + $r.scoreReading)
Write-Host ("  Part 5:     " + $r.partBreakdown.part5.correct + "/" + $r.partBreakdown.part5.total)

Write-Host ""
Write-Host "=== TEST 6: GET /results/:id (review mode, correctAnswer visible) ===" -ForegroundColor Cyan
$detailRes = Invoke-RestMethod -Uri ("$base/results/" + $r._id) -Headers $headers
$firstAnswer = $detailRes.data.result.answers[0]
Write-Host "Answer 1:"
Write-Host ("  Selected:   " + $firstAnswer.selected)
Write-Host ("  isCorrect:  " + $firstAnswer.isCorrect)
Write-Host ("  correctAnswer (from question): " + $firstAnswer.question.correctAnswer + "  (expected: visible)")
$expLen = if ($firstAnswer.question.explanation) { $firstAnswer.question.explanation.Length } else { 0 }
Write-Host ("  Explanation length: " + $expLen + " chars  (expected: > 0)")

Write-Host ""
Write-Host "=== TEST 7: GET /results (history) ===" -ForegroundColor Cyan
$historyRes = Invoke-RestMethod -Uri "$base/results" -Headers $headers
Write-Host ("Total results for user: " + $historyRes.data.pagination.total)
$historyRes.data.items | Select-Object -First 5 | ForEach-Object {
  $title = if ($_.testId) { $_.testId.title } else { 'unknown' }
  Write-Host ("  [" + $_.testType + "] " + $title + " - " + $_.correctCount + "/" + $_.totalQuestions + " correct")
}

Write-Host ""
Write-Host "=== ALL TESTS PASSED ===" -ForegroundColor Green
