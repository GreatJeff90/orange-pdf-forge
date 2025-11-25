import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import logo from "@/assets/logo.png";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters" }).max(100).optional(),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validationData = isLogin 
        ? { email, password }
        : { email, password, fullName };
      
      authSchema.parse(validationData);

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please login instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signup Failed",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Account Created!",
          description: "Welcome to PDF-Orange. Redirecting...",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary">
      <div className="max-w-md mx-auto w-full min-h-screen flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-12 mt-8">
          <img src={logo} alt="PDF-Orange" className="w-12 h-12 rounded-xl mr-3" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">PDF-Orange</h1>
            <p className="text-xs text-muted-foreground">Futuristic PDF Tools</p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="glass-effect rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Sign in to continue your PDF journey"
                : "Join PDF-Orange and start converting"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  maxLength={100}
                  className="glass-effect border-glass"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="glass-effect border-glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={100}
                className="glass-effect border-glass"
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-6 futuristic-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center space-y-3">
            {isLogin && (
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-muted-foreground hover:text-orange-500 transition-colors block w-full"
              >
                Forgot password?
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setPassword("");
                setFullName("");
              }}
              className="text-sm text-muted-foreground hover:text-orange-500 transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
