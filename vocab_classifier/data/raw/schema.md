Field Data type Mục đích
sample_id string ID duy nhất của sense
word_id string Liên kết với vocabulary item
word string Từ vựng
sense_index integer Vị trí sense trong từ
pos string Part of speech
definition string Định nghĩa tiếng Anh
examples list[string] Các câu ví dụ
collocations list[string] Các cụm từ thường đi cùng
main_topic string/null Nhãn cấp 1 (10 Topical Domains hoặc General Vocabulary)
main_topic_id string/null Mã nhãn cấp 1 (env..gov hoặc gen)
topic_type string/null Nhánh phân loại (topical hoặc general)
subtopic string/null Tên nhãn cấp 2 (ví dụ: Function Words)
subtopic_id string/null Mã nhãn cấp 2 (ví dụ: gen.function)
source_topic string/null Topic gốc
label_source string Nguồn tạo nhãn
label_status string Trạng thái kiểm duyệt (main_topic_reviewed, needs_review, subtopic_auto_labeled, human_verified)
