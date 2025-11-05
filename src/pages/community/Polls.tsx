import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/contexts/CommunityContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PieChart, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Polls = () => {
  const { user } = useAuth();
  const { polls, addPoll, votePoll, getPolls } = useCommunity();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);

  const allPolls = getPolls();
  const isOwnerOrAdmin = user?.role === "owner" || user?.role === "admin";

  const handleCreatePoll = () => {
    if (!question.trim() || options.some(o => !o.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    addPoll({
      question,
      options,
      votes: [0, 0, 0],
    });

    toast({
      title: "✅ Poll Created",
      description: "Your poll has been published to the community",
    });

    setQuestion("");
    setOptions(["", "", ""]);
    setOpen(false);
  };

  const handleVote = (pollId: string, optionIndex: number) => {
    const success = votePoll(pollId, optionIndex);
    
    if (success) {
      toast({
        title: "✅ Vote Recorded",
        description: "Thank you for participating!",
      });
    } else {
      toast({
        title: "Already Voted",
        description: "You can only vote once per poll",
        variant: "destructive",
      });
    }
  };

  const getPollData = (poll: typeof allPolls[0]) => {
    const totalVotes = poll.votes.reduce((sum, v) => sum + v, 0);
    const maxVotes = Math.max(...poll.votes);
    
    return poll.options.map((option, index) => ({
      name: option,
      votes: poll.votes[index],
      percentage: totalVotes > 0 ? ((poll.votes[index] / totalVotes) * 100).toFixed(1) : "0",
      isLeading: poll.votes[index] === maxVotes && maxVotes > 0,
    }));
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))'];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <BackButton />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <PieChart className="h-8 w-8" />
              Community Polls & Surveys
            </h1>
            <p className="text-muted-foreground">
              Participate in community decisions and share your opinions
            </p>
          </div>
          
          {isOwnerOrAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="mt-4 md:mt-0">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Poll
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Poll</DialogTitle>
                  <DialogDescription>
                    Ask a question and provide three options for the community to vote on
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      placeholder="What would you like to ask?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                  </div>
                  
                  {options.map((option, index) => (
                    <div key={index}>
                      <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                      <Input
                        id={`option-${index}`}
                        placeholder={`Enter option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                      />
                    </div>
                  ))}
                  
                  <Button onClick={handleCreatePoll} className="w-full">
                    Create Poll
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {allPolls.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No polls yet</p>
                {isOwnerOrAdmin && (
                  <Button onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Poll
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {allPolls.map((poll) => {
              const pollData = getPollData(poll);
              const totalVotes = poll.votes.reduce((sum, v) => sum + v, 0);
              const hasVoted = user ? poll.voters.includes(user.uid) : false;

              return (
                <Card key={poll.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{poll.question}</CardTitle>
                        <CardDescription>
                          Posted on {new Date(poll.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          {" • "}
                          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                        </CardDescription>
                      </div>
                      {hasVoted && (
                        <Badge>Voted</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!hasVoted ? (
                      <div className="space-y-3">
                        {poll.options.map((option, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-4"
                            onClick={() => handleVote(poll.id, index)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span>{option}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={pollData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                                      <p className="font-semibold">{payload[0].payload.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {payload[0].value} votes ({payload[0].payload.percentage}%)
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                              {pollData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.isLeading ? 'hsl(var(--primary))' : COLORS[index % COLORS.length]}
                                  opacity={entry.isLeading ? 1 : 0.7}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        
                        <div className="grid gap-2">
                          {pollData.map((data, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className={data.isLeading ? "font-semibold text-primary" : ""}>
                                {data.name}
                              </span>
                              <span className={data.isLeading ? "font-semibold text-primary" : "text-muted-foreground"}>
                                {data.votes} ({data.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Polls;
