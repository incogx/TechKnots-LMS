import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { CertificateGenerator } from "@/components/CertificateGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCourseById } from "@/lib/services/courseService";

const Certificate = () => {
  const { id } = useParams<{ id: string }>();
  const [courseTitle, setCourseTitle] = useState("Course Completion");

  useEffect(() => {
    const loadCourse = async () => {
      if (!id) return;
      try {
        const course = await getCourseById(id);
        if (course?.title) {
          setCourseTitle(course.title);
        }
      } catch {
        // Keep fallback title if course lookup fails.
      }
    };

    void loadCourse();
  }, [id]);

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Course not found.</p>
            <Link to="/courses">
              <Button className="mt-4" variant="outline">Back to Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Link to={`/courses/${id}`}>
        <Button variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
      </Link>

      <CertificateGenerator courseId={id} courseTitle={courseTitle} />
    </div>
  );
};

export default Certificate;
