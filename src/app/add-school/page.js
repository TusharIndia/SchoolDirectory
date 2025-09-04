import { School } from 'lucide-react';
import AddSchool from '../../components/addSchool';

export default function AddSchoolPage() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <School size={32} className="text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Add a New School</h1>
          <p className="text-lg text-gray-600">Help other students by adding school information to our directory</p>
        </div>

        <div>
          <AddSchool />
        </div>
      </div>
    </div>
  );
}
