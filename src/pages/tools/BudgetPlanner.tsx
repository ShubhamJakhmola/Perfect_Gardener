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

// Indian market prices (approximate, 2024) - ORIGINAL DATA
const costData = {
  pots: {
    basic: 20,      // ₹20 per 6-inch pot
    standard: 35,   // ₹35 per 8-inch pot
    premium: 60     // ₹60 per 10-inch pot
  },
  soil: {
    basic: 50,      // ₹50 per kg (basic mix)
    standard: 80,   // ₹80 per kg (standard mix)
    premium: 150    // ₹150 per kg (organic)
  },
  seeds: {
    flower: 30,
    vegetable: 40,
    herb: 50,
    mixed: 35
  },
  saplings: {
    flower: 50,
    vegetable: 30,
    herb: 40,
    mixed: 40
  },
  fertilizer: {
    basic: 150,
    standard: 250,
    premium: 400
  },
  tools: {
    basic: 200,
    standard: 400,
    premium: 600
  }
};

interface BudgetResult {
  numPots: number;
  plantType: string;
  soilQuality: string;
  totalPotsCost: number;
  totalSoilCost: number;
  totalSoilKg: number;
  potCost: number;
  totalSeedCost: number;
  totalSaplingCost: number;
  fertilizer: number;
  toolsCost: number;
  subtotal: number;
}

const BudgetPlanner = () => {
  const [numPots, setNumPots] = useState("10");
  const [plantType, setPlantType] = useState("flower");
  const [budget, setBudget] = useState("standard");
  const [soilQuality, setSoilQuality] = useState("standard");
  const [result, setResult] = useState<BudgetResult | null>(null);

  const calculateBudget = () => {
    const pots = parseInt(numPots);

    if (!pots || pots < 1 || pots > 100) {
      alert("Please enter a valid number of pots (1-100)");
      return;
    }

    // Calculate costs (ORIGINAL LOGIC)
    const potCost = costData.pots[soilQuality === 'basic' ? 'basic' : soilQuality === 'premium' ? 'premium' : 'standard'];
    const totalPotsCost = potCost * pots;

    const soilPerPot = soilQuality === 'basic' ? 0.5 : soilQuality === 'premium' ? 0.7 : 0.6;
    const totalSoilKg = pots * soilPerPot;
    const soilCost = costData.soil[soilQuality as keyof typeof costData.soil];
    const totalSoilCost = totalSoilKg * soilCost;

    const seedCost = costData.seeds[plantType as keyof typeof costData.seeds];
    const totalSeedCost = seedCost * (pots / 5);

    const saplingCost = costData.saplings[plantType as keyof typeof costData.saplings];
    const totalSaplingCost = saplingCost * (pots / 3);

    const fertilizer = costData.fertilizer[soilQuality as keyof typeof costData.fertilizer];
    const toolsCost = costData.tools[soilQuality as keyof typeof costData.tools];

    const subtotal = totalPotsCost + totalSoilCost + totalSeedCost + totalSaplingCost + fertilizer + toolsCost;

    setResult({
      numPots: pots,
      plantType,
      soilQuality,
      totalPotsCost,
      totalSoilCost,
      totalSoilKg,
      potCost,
      totalSeedCost,
      totalSaplingCost,
      fertilizer,
      toolsCost,
      subtotal,
    });
  };

  const resetForm = () => {
    setNumPots("10");
    setPlantType("flower");
    setBudget("standard");
    setSoilQuality("standard");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
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
              💰 Gardening Budget Planner (₹)
            </h1>
            <p className="text-muted-foreground">
              Estimate your gardening setup costs based on plant type, quantity, and desired budget.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numPots">Number of Pots:</Label>
                <Input
                  id="numPots"
                  type="number"
                  placeholder="e.g., 10"
                  min={1}
                  max={100}
                  value={numPots}
                  onChange={(e) => setNumPots(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantType">Plant Type:</Label>
                <Select value={plantType} onValueChange={setPlantType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flower">Flowering Plants</SelectItem>
                    <SelectItem value="vegetable">Vegetables</SelectItem>
                    <SelectItem value="herb">Herbs</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range (Optional, ₹):</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget (₹500-2000)</SelectItem>
                    <SelectItem value="standard">Standard (₹2000-5000)</SelectItem>
                    <SelectItem value="premium">Premium (₹5000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="soilQuality">Soil Quality:</Label>
                <Select value={soilQuality} onValueChange={setSoilQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Mix</SelectItem>
                    <SelectItem value="standard">Standard Mix</SelectItem>
                    <SelectItem value="premium">Premium Organic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <Button onClick={calculateBudget} className="flex-1 sm:flex-none">
                Calculate Budget
              </Button>
              <Button onClick={resetForm} variant="secondary" className="flex-1 sm:flex-none">
                Reset
              </Button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-primary mb-2">
                💰 Budget Estimate for {result.numPots} Pots ({result.plantType} garden)
              </h2>

              <h3 className="font-semibold text-foreground mb-4">📊 Your Gardening Budget Breakdown</h3>
              <p className="text-muted-foreground text-sm mb-6">
                {result.numPots} pots • {result.plantType} plants • {result.soilQuality} soil quality
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <span className="text-foreground font-medium">🪴 Pots ({result.numPots} × ₹{result.potCost})</span>
                  <span className="text-primary font-semibold">₹{result.totalPotsCost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <span className="text-foreground font-medium">🌍 Soil ({result.totalSoilKg.toFixed(1)} kg)</span>
                  <span className="text-primary font-semibold">₹{result.totalSoilCost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <span className="text-foreground font-medium">🌱 Seeds & Saplings</span>
                  <span className="text-primary font-semibold">₹{(result.totalSeedCost + result.totalSaplingCost).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <span className="text-foreground font-medium">🌿 Fertilizer (Initial)</span>
                  <span className="text-primary font-semibold">₹{result.fertilizer.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <span className="text-foreground font-medium">🛠️ Tools & Accessories</span>
                  <span className="text-primary font-semibold">₹{result.toolsCost.toLocaleString()}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/15 to-primary/10 rounded-lg border-t-2 border-primary mb-6">
                <span className="text-primary font-bold text-lg">💰 Total Setup Cost:</span>
                <span className="text-primary font-bold text-xl">₹{result.subtotal.toLocaleString()}</span>
              </div>

              {/* Percentage Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-background border border-border rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground uppercase mb-2">Pots</div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((result.totalPotsCost / result.subtotal) * 100)}%
                  </div>
                </div>
                <div className="bg-background border border-border rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground uppercase mb-2">Soil</div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((result.totalSoilCost / result.subtotal) * 100)}%
                  </div>
                </div>
                <div className="bg-background border border-border rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground uppercase mb-2">Plants</div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(((result.totalSeedCost + result.totalSaplingCost) / result.subtotal) * 100)}%
                  </div>
                </div>
              </div>

              {/* Money-Saving Tips */}
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-3">💡 Money-Saving Tips</h4>
                <ul className="space-y-2 text-sm text-foreground list-disc list-inside">
                  <li>Buy pots in bulk - save 10-15%</li>
                  <li>Make your own compost</li>
                  <li>Use seeds vs saplings - save 40-50%</li>
                  <li>Reuse old containers</li>
                  <li>Share tools with neighbors</li>
                  <li>Buy seasonal seeds on sale</li>
                  <li>Monthly budget: ₹{Math.round(result.subtotal / 6)}-₹{Math.round(result.subtotal / 4)}</li>
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

export default BudgetPlanner;
