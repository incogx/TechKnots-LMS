// src/pages/AdminCreateCourse.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";

import { useAuth } from "@/context/AuthContext";
import { createCourse } from "@/lib/services/courseService";
import { storage } from "@/lib/firebaseClient"; // storage singleton
import type { Course } from "@/lib/types";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().optional().transform((s) => (s ? s.trim() : undefined)),
  category: z.string().min(2).optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  instructor: z.string().optional(),
  description: z.string().optional(),
  // coverFile will be handled outside zod (file inputs are tricky)
});

type CourseForm = z.infer<typeof CourseSchema>;

const AdminCreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, role, loading } = useAuth();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(CourseSchema),
    defaultValues: {
      level: "Beginner",
      category: "General",
    } as Partial<CourseForm>,
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (role && role !== "admin" && role !== "mentor") {
      toast.error("Access denied: admins & mentors only");
      navigate("/", { replace: true });
    }
  }, [user, role, loading, navigate]);

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Course>) => {
      return createCourse(payload);
    },
    onSuccess: (created) => {
      toast.success("Course created successfully");
      // invalidate courses list
      queryClient.invalidateQueries(["allCourses"]);
      // navigate to new course detail page
      navigate(`/courses/${created.slug ?? created.id}`);
    },
    onError: (err: any) => {
      console.error("createCourse error:", err);
      toast.error("Failed to create course");
    },
  });

  const onSubmit = async (values: CourseForm) => {
    try {
      setUploading(true);
      let coverUrl: string | undefined = undefined;

      if (coverFile) {
        // Generate a safe storage path
        const filename = `${Date.now()}_${coverFile.name.replace(/\s+/g, "_")}`;
        const sRef = storageRef(storage, `course-covers/${filename}`);
        // upload
        await uploadBytes(sRef, coverFile);
        coverUrl = await getDownloadURL(sRef);
      }

      const payload: Partial<Course> = {
        title: values.title,
        slug: values.slug,
        category: values.category,
        level: values.level,
        instructor: values.instructor,
        description: values.description,
        coverImage: coverUrl,
        tags: [], // you can extend form to accept tags
      };

      await createMutation.mutateAsync(payload);
      reset();
      setCoverFile(null);
    } catch (err) {
      console.error("Error submitting create course:", err);
      toast.error("Course creation failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} placeholder="Complete JavaScript Masterclass" />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input id="slug" {...register("slug")} placeholder="js-masterclass" />
              {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...register("category")} placeholder="Web Development" />
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
              <select id="level" {...register("level")} className="w-full rounded-md border p-2">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input id="instructor" {...register("instructor")} placeholder="Instructor name" />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} rows={6} placeholder="Course summary and outcomes" />
            </div>

            <div>
              <Label htmlFor="cover">Cover Image (optional)</Label>
              <input
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setCoverFile(f);
                }}
                className="mt-2"
              />
              {coverFile && <p className="text-sm mt-1">{coverFile.name}</p>}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading || createMutation.isLoading}>
                {uploading || createMutation.isLoading ? "Creating..." : "Create Course"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setCoverFile(null); }}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateCourse;
