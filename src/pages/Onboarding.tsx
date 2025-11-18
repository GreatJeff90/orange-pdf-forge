import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Image, Scissors, FileStack, Award } from "lucide-react";

const onboardingSlides = [
  {
    icon: FileText,
    gradient: "from-blue-500 to-blue-700",
    title: "Welcome to PDF-Orange",
    description: "Your ultimate futuristic PDF conversion toolkit with powerful features at your fingertips.",
  },
  {
    icon: Image,
    gradient: "from-purple-500 to-purple-700",
    title: "Convert Anything",
    description: "Transform PDFs to Word, images to PDFs, and everything in between with lightning-fast processing.",
  },
  {
    icon: Scissors,
    gradient: "from-green-500 to-green-700",
    title: "Advanced Tools",
    description: "Split, merge, and compress your PDFs with professional-grade tools designed for efficiency.",
  },
  {
    icon: Award,
    gradient: "from-orange-500 to-orange-600",
    title: "Earn Rewards",
    description: "Complete tasks, earn coins, and unlock premium features. Your conversions pay off!",
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/auth");
    }
  };

  const skipOnboarding = () => {
    navigate("/auth");
  };

  const slide = onboardingSlides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary">
      <div className="max-w-md mx-auto w-full min-h-screen flex flex-col p-6">
        {/* Skip Button */}
        <div className="flex justify-end mb-8">
          <Button
            variant="ghost"
            onClick={skipOnboarding}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
          <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center shadow-xl neon-glow`}>
            <Icon className="w-16 h-16 text-white" />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold gradient-text">{slide.title}</h1>
            <p className="text-muted-foreground text-lg px-4">
              {slide.description}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-6 pb-8">
          {/* Dots Indicator */}
          <div className="flex justify-center gap-2">
            {onboardingSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-gradient-to-r from-orange-500 to-orange-600"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <Button
            onClick={nextSlide}
            className="w-full py-6 text-lg futuristic-btn"
          >
            {currentSlide === onboardingSlides.length - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
