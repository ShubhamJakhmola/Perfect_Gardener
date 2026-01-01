import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEO } from "@/components/SEO";

interface PotResult {
  plantName: string;
  plantType: string;
  minPotSize: number;
  maxPotSize: number;
  avgPotSize: number;
  soilLiters: number;
  soilKg: number;
}

const PotCalculator = () => {
  const [plantType, setPlantType] = useState("");
  const [plantSize, setPlantSize] = useState("");
  const [plantName, setPlantName] = useState("");
  const [growthRate, setGrowthRate] = useState("moderate");
  const [result, setResult] = useState<PotResult | null>(null);

  const calculatePotSize = () => {
    const size = parseFloat(plantSize);
    
    if (!plantType || !size || size < 4) {
      alert("Please select a plant type and enter a valid plant size (4-48 inches)");
      return;
    }

    // Calculate pot size based on plant size and growth rate (ORIGINAL LOGIC)
    let minPotSize = size / 2;
    let maxPotSize = size;

    if (growthRate === "fast") {
      maxPotSize = size * 1.5;
    } else if (growthRate === "slow") {
      minPotSize = Math.max(6, size / 3);
    }

    // Add 20% buffer for water retention
    minPotSize = Math.max(6, Math.round(minPotSize * 10) / 10);
    maxPotSize = Math.round(maxPotSize * 10) / 10;

    // Calculate soil quantity (volume in liters)
    const avgPotSize = (minPotSize + maxPotSize) / 2;
    const soilLiters = Math.round(((avgPotSize / 2) ** 2) * Math.PI * avgPotSize / 6.1 * 10) / 10;
    const soilKg = parseFloat((soilLiters * 0.6).toFixed(1));

    setResult({
      plantName: plantName || "Your plant",
      plantType,
      minPotSize,
      maxPotSize,
      avgPotSize,
      soilLiters,
      soilKg,
    });
  };

  const resetForm = () => {
    setPlantType("");
    setPlantSize("");
    setPlantName("");
    setGrowthRate("moderate");
    setResult(null);
  };

  const getPlantTypeLabel = (type: string) => {
    switch (type) {
      case "flower": return "🌸 Flowering Plant";
      case "vegetable": return "🥕 Vegetable";
      case "herb": return "🌿 Herb";
      default: return "Plant";
    }
  };

  const getDrainageTip = (type: string) => {
    switch (type) {
      case "flower": return "For Flowers: Use well-draining potting soil, add perlite";
      case "vegetable": return "For Vegetables: Mix soil with compost (1:1 ratio)";
      case "herb": return "For Herbs: Use light, well-draining potting mix with sand";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pot Size Calculator for Plants"
        description="Calculate the ideal pot size for your plants and estimate soil requirements. Free online tool to determine correct pot diameter, soil quantity in liters and kg for flowers, vegetables, and herbs."
        keywords="pot size calculator, plant pot calculator, pot size for plants, soil calculator, container size calculator, gardening pot calculator, how to choose pot size, plant container calculator"
        url="https://perfectgardener.netlify.app/tools/pot-calculator"
      />
      <Header />
      
      <main id="main-content" className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link 
            to="/tools" 
            className="inline-flex items-center text-primary hover:underline mb-6 font-medium"
          >
            ← Back to Tools Hub
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              ⚱️🛠️ Pot Size Calculator for Plants
            </h1>
            <p className="text-muted-foreground">
              Calculate the ideal pot size, soil quantity, and drainage requirements for your plants.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="plantType">Plant Type:</Label>
                <Select value={plantType} onValueChange={setPlantType}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Select Plant Type --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flower">Flowering Plant</SelectItem>
                    <SelectItem value="vegetable">Vegetable</SelectItem>
                    <SelectItem value="herb">Herb</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantSize">Expected Plant Size (in inches):</Label>
                <Input
                  id="plantSize"
                  type="number"
                  placeholder="e.g., 12 for 12 inches"
                  min={4}
                  max={48}
                  value={plantSize}
                  onChange={(e) => setPlantSize(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantName">Plant Name (Optional):</Label>
                <Input
                  id="plantName"
                  type="text"
                  placeholder="e.g., Tomato, Rose, Basil"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="growthRate">Growth Rate:</Label>
                <Select value={growthRate} onValueChange={setGrowthRate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow Growing</SelectItem>
                    <SelectItem value="moderate">Moderate Growing</SelectItem>
                    <SelectItem value="fast">Fast Growing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <Button onClick={calculatePotSize} className="flex-1 sm:flex-none">
                Calculate Pot Size
              </Button>
              <Button onClick={resetForm} variant="secondary" className="flex-1 sm:flex-none">
                Reset
              </Button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-primary mb-4">
                📏 Pot Sizing Recommendation for {result.plantName}
              </h2>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{getPlantTypeLabel(result.plantType)}</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <span className="font-semibold text-sm text-foreground">📏 Pot Diameter Range</span>
                  <span className="text-muted-foreground">
                    {Math.round(result.avgPotSize * 0.7 * 10) / 10}" - {Math.round(result.avgPotSize * 1.2 * 10) / 10}"
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <span className="font-semibold text-sm text-foreground">🎯 Recommended Diameter</span>
                  <span className="text-muted-foreground">~{result.avgPotSize}" diameter pot</span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <span className="font-semibold text-sm text-foreground">🪴 Soil Quantity (Liters)</span>
                  <span className="text-muted-foreground">{result.soilLiters} L</span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <span className="font-semibold text-sm text-foreground">🪨 Soil Quantity (Kg)</span>
                  <span className="text-muted-foreground">~{result.soilKg} kg</span>
                </div>
              </div>

              {/* Drainage Tips */}
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-3">💧 Drainage & Soil Tips</h4>
                <ul className="space-y-2 text-sm text-foreground">
                  <li><strong>Drainage Holes:</strong> Ensure at least 2-3 drainage holes at bottom</li>
                  <li><strong>Soil Mix:</strong> Use potting soil with 30-40% organic compost</li>
                  <li><strong>Soil Depth:</strong> Leave 1-2 inches from soil surface to pot rim</li>
                  <li><strong>Base Layer:</strong> Add 1-2 inches coarse sand/gravel for drainage</li>
                  {result.plantType && (
                    <li><strong>{getDrainageTip(result.plantType)}</strong></li>
                  )}
                  <li><strong>Watering:</strong> Water until it drains from bottom, avoid waterlogging</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default PotCalculator;
