-- ====================================
-- 新規ユーザー作成時の自動プロフィール作成トリガー
-- ====================================

-- トリガー関数：新規ユーザー作成時にプロフィールを自動作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- デフォルトで生徒として作成（後で変更可能）
  INSERT INTO public.mukimuki_profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'ユーザー'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー作成：auth.users に新規ユーザーが追加されたときに実行
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
