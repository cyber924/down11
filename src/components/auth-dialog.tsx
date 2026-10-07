
'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';

export function AuthDialog() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: '로그인 성공', description: 'Google 계정으로 로그인되었습니다.' });
      setOpen(false);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error.code, error.message);
      toast({
        variant: 'destructive',
        title: '로그인 실패',
        description: 'Google 로그인에 실패했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 공백으로 인한 인증 실패 방지
    const cleanEmail = email.trim();

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        toast({ title: '로그인 성공', description: '환영합니다!' });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(userCredential.user, { displayName: name });
        toast({ title: '회원가입 성공', description: '성공적으로 가입되었습니다.' });
      }
      setOpen(false);
    } catch (error: any) {
      console.error("Auth Error:", error.code, error.message);
      
      let errorMessage = '인증에 실패했습니다. 다시 시도해주세요.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일 주소입니다.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = '이메일/비밀번호 로그인 제공업체가 Firebase 콘솔에서 활성화되지 않았습니다. Google 로그인 버튼을 이용하시거나 Firebase 콘솔에서 이를 활성화해 주세요.';
      }

      toast({
        variant: 'destructive',
        title: '오류 발생',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 border-slate-200 font-bold h-10 rounded-full">
          <LogIn className="w-4 h-4" />
          로그인 / 회원가입
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline font-bold text-xl">{isLogin ? '로그인' : '회원가입'}</DialogTitle>
          <DialogDescription className="text-[13px] font-medium">
            {isLogin
              ? '이메일과 비밀번호를 입력하여 로그인하세요.'
              : '새로운 계정을 생성하여 서비스를 이용하세요.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">이름</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
                className="rounded-xl h-11"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl bg-primary font-bold shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl font-bold flex items-center justify-center gap-2 border-slate-200"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.62-1.49 2.56-3.69 2.56-6.29z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google 계정으로 계속하기
          </Button>
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-xs font-bold text-primary"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
