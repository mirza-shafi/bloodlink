import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { Heart, Search, UserCheck, Droplets, ArrowRight, MapPin, Clock, Activity } from 'lucide-react';
import { donorApi, requestApi } from '@/services/api';
import type { Donor, BloodRequest } from '@/types';
import { BloodGroup, RequestStatus } from '@/types';

// Hero Blood Cell Canvas Animation
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const cells: { x: number; y: number; r: number; dx: number; dy: number; opacity: number }[] = [];
    for (let i = 0; i < 40; i++) {
      cells.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: 8 + Math.random() * 20,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        opacity: 0.3 + Math.random() * 0.5,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      cells.forEach(cell => {
        cell.x += cell.dx;
        cell.y += cell.dy;
        if (cell.x < -cell.r) cell.x = canvas.offsetWidth + cell.r;
        if (cell.x > canvas.offsetWidth + cell.r) cell.x = -cell.r;
        if (cell.y < -cell.r) cell.y = canvas.offsetHeight + cell.r;
        if (cell.y > canvas.offsetHeight + cell.r) cell.y = -cell.r;

        // Draw blood cell
        const grad = ctx.createRadialGradient(cell.x, cell.y, 0, cell.x, cell.y, cell.r);
        grad.addColorStop(0, `rgba(214, 40, 40, ${cell.opacity})`);
        grad.addColorStop(0.7, `rgba(157, 2, 8, ${cell.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(214, 40, 40, 0)`);
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner concave (blood cell dimple)
        ctx.beginPath();
        ctx.arc(cell.x - cell.r * 0.2, cell.y - cell.r * 0.2, cell.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${cell.opacity * 0.15})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// Rolling Counter Animation
function RollingCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 5);
      start = Math.floor(eased * target);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => requestAnimationFrame(animate), 500);
    return () => clearTimeout(timer);
  }, [target]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const [featuredDonors, setFeaturedDonors] = useState<Donor[]>([]);
  const [recentRequests, setRecentRequests] = useState<BloodRequest[]>([]);

  useEffect(() => {
    donorApi.getAllDonors().then(res => {
      if (res.success) setFeaturedDonors(res.data.slice(0, 4));
    });
    requestApi.getRequestsByDonor(1).then(res => {
      if (res.success) setRecentRequests(res.data.slice(0, 4));
    });
  }, []);

  const steps = [
    {
      icon: UserCheck,
      title: 'Register',
      desc: 'Create your profile as a donor or patient in under 2 minutes.',
      image: '/register-icon.png',
    },
    {
      icon: Search,
      title: 'Match',
      desc: 'Our AI engine finds the perfect donor match based on compatibility.',
      image: '/match-icon.png',
    },
    {
      icon: Heart,
      title: 'Donate',
      desc: 'Connect, communicate, and make a life-saving donation.',
      image: '/donate-icon.png',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#F9F9F9] via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-red-950/20">
        <HeroCanvas />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-red-100 dark:bg-red-950/30 text-[#D62828] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 text-xs font-medium px-3 py-1 border-0">
                <Activity className="w-3 h-3 mr-1" />
                AI-Powered Blood Matching
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1A1A1A] dark:text-white leading-[0.95] tracking-tight">
                Every Drop
                <span className="block text-[#D62828]">Counts.</span>
              </h1>
              <p className="text-lg text-[#555555] dark:text-zinc-400 max-w-lg leading-relaxed">
                BloodLink connects those in urgent need with verified local donors in real-time.
                Our AI-powered matching ensures the best donor-patient connections.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/search')}
                  className="bg-[#D62828] hover:bg-[#9D0208] text-white px-8 py-6 text-base font-medium rounded-none border-0"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find a Donor
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/register')}
                  className="border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#1A1A1A] dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 px-8 py-6 text-base font-medium rounded-none"
                >
                  Become a Donor
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-[#1A1A1A] dark:text-white"><RollingCounter target={1247} /></p>
                  <p className="text-sm text-[#555555] dark:text-zinc-400">Active Donors</p>
                </div>
                <div className="w-px bg-gray-200 dark:bg-zinc-800" />
                <div>
                  <p className="text-3xl font-bold text-[#1A1A1A] dark:text-white"><RollingCounter target={3842} /></p>
                  <p className="text-sm text-[#555555] dark:text-zinc-400">Lives Saved</p>
                </div>
                <div className="w-px bg-gray-200 dark:bg-zinc-800" />
                <div>
                  <p className="text-3xl font-bold text-[#1A1A1A] dark:text-white"><RollingCounter target={98} suffix="%" /></p>
                  <p className="text-sm text-[#555555] dark:text-zinc-400">Match Rate</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <img
                src="/hero-bg.jpg"
                alt="Blood cells"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-[#D62828]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">O- Universal Donor</p>
                    <p className="text-xs text-[#555555] dark:text-zinc-400">Compatible with all types</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Stat Section */}
      <section className="bg-white dark:bg-zinc-950 py-20 border-t border-b border-gray-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[120px] sm:text-[180px] font-bold text-red-50/50 dark:text-red-950/20 leading-none select-none">
            01
          </p>
          <div className="-mt-16 relative z-10">
            <p className="text-2xl sm:text-3xl font-medium text-[#1A1A1A] dark:text-white mb-2">
              Every <span className="text-[#D62828] font-bold">2 seconds</span>, someone needs blood.
            </p>
            <p className="text-[#555555] dark:text-zinc-400">
              One donation can save up to three lives. Your contribution matters.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#F9F9F9] dark:bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-4">How It Works</h2>
            <p className="text-[#555555] dark:text-zinc-400 max-w-2xl mx-auto">
              Three simple steps to connect donors with patients and save lives.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <Card key={idx} className="p-8 border-t-2 border-t-[#D62828] border-zinc-200 dark:border-zinc-800 rounded-none shadow-sm hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900">
                <div className="mb-6">
                  <img src={step.image} alt={step.title} className="w-20 h-20 object-contain" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-[#D62828] uppercase tracking-wider">
                    Step {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#555555] dark:text-zinc-400 leading-relaxed">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Donors */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-2">Featured Donors</h2>
              <p className="text-[#555555] dark:text-zinc-400">Verified donors ready to help</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/search')} className="hidden sm:flex rounded-none border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDonors.map(donor => (
              <Card key={donor.id} className="p-6 rounded-none hover:shadow-lg transition-all cursor-pointer group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                onClick={() => navigate(`/search`)}>
                <div className="relative mb-4">
                  <img src={donor.profilePhoto || '/avatar-male.jpg'} alt={donor.fullName}
                    className="w-16 h-16 rounded-full object-cover border border-zinc-100 dark:border-zinc-800" />
                  <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${
                    donor.availabilityStatus === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <h3 className="font-semibold text-[#1A1A1A] dark:text-white group-hover:text-[#D62828] dark:group-hover:text-red-400 transition-colors">
                  {donor.fullName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-red-100 dark:bg-red-950/40 text-[#D62828] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 text-xs border-0">
                    {donor.bloodGroup}
                  </Badge>
                  <span className="text-xs text-[#555555] dark:text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{donor.currentLocation}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs text-[#555555] dark:text-zinc-400">
                  <Heart className="w-3 h-3 text-[#D62828]" />
                  {donor.donationCount} donations
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Requests Feed */}
      <section className="py-24 bg-[#F9F9F9] dark:bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-2">Live Request Feed</h2>
            <p className="text-[#555555] dark:text-zinc-400">Real-time blood requests from patients</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {recentRequests.length > 0 ? recentRequests.map(req => (
              <Card key={req.id} className="p-6 rounded-none border-l-4 border-l-[#D62828] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-start mb-3">
                  <Badge className={`${
                    req.emergencyLevel === 'CRITICAL' ? 'bg-red-600 text-white' :
                    req.emergencyLevel === 'HIGH' ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-white'
                  } border-0`}>
                    {req.emergencyLevel}
                  </Badge>
                  <span className="text-xs text-[#555555] dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1A1A1A] dark:text-white mb-1">{req.patientName}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[#D62828] border-[#D62828]">{req.bloodGroup}</Badge>
                  <span className="text-xs text-[#555555] dark:text-zinc-400">{req.hospitalName}</span>
                </div>
                <p className="text-sm text-[#555555] dark:text-zinc-400 mb-3">{req.message}</p>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className={`${
                    req.status === RequestStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                    req.status === RequestStatus.ACCEPTED ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  } border-0`}>
                    {req.status}
                  </Badge>
                  <Button size="sm" onClick={() => navigate('/search')} className="bg-[#D62828] hover:bg-[#9D0208] text-white rounded-none text-xs border-0">
                    Help Now
                  </Button>
                </div>
              </Card>
            )) : (
              <div className="col-span-2 text-center py-12 text-[#555555] dark:text-zinc-400">
                No active requests at the moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Blood Group Availability */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-2">Blood Type Availability</h2>
            <p className="text-[#555555] dark:text-zinc-400">Current donor counts by blood group</p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 max-w-4xl mx-auto">
            {Object.values(BloodGroup).map(bg => (
              <div key={bg} className="text-center group cursor-pointer"
                onClick={() => navigate('/search')}>
                <div className="w-full aspect-square bg-red-50 dark:bg-red-950/20 border border-zinc-200 dark:border-zinc-800 group-hover:bg-[#D62828] group-hover:dark:bg-[#D62828] transition-all duration-300 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-[#D62828] dark:text-red-400 group-hover:text-white dark:group-hover:text-white transition-colors">{bg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#111111] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Join the Network.<br />
            <span className="text-[#D62828]">Save a Life.</span>
          </h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            Whether you are a donor or a patient, BloodLink is here to help you connect and make a difference.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-[#D62828] hover:bg-[#9D0208] text-white px-10 py-6 text-base font-medium rounded-none"
            >
              <Heart className="w-5 h-5 mr-2" />
              Register as Donor
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/search')}
              className="border-white text-white hover:bg-white hover:text-[#111111] px-10 py-6 text-base font-medium rounded-none"
            >
              <Search className="w-5 h-5 mr-2" />
              Find a Donor
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
