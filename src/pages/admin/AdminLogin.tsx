import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isLoggingIn, isAuthenticated } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await login({ email, password });
      toast.success("Successfully logged in");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      const error = err as Error;
      toast.error(error.message || "Failed to log in. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Back to Website Button */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10 z-20">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Website
        </Link>
      </div>

      
      <Card className="w-full max-w-md border-border bg-card/90 backdrop-blur-xl shadow-gold shadow-lg text-foreground relative z-10 transition-all duration-300 hover:border-primary/30">
        <CardHeader className="space-y-2 text-center pb-8 border-b border-border">
          <div className="mx-auto w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-2 transform hover:rotate-12 transition-transform duration-300">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-serif font-bold tracking-tight text-gradient">Admin Panel</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Sign in to manage your inventory and products.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@slgphotoframes.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoggingIn}
                  className="pl-10 bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all duration-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoggingIn}
                  className="pl-10 bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all duration-200"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-xl shadow-gold hover:shadow-gold transition-all duration-300 flex items-center justify-center gap-2 group mt-6 hover-lift"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border py-4 text-xs text-muted-foreground/60">
          Authorized personnel only. Activities are monitored.
        </CardFooter>
      </Card>
    </div>
  );
}
