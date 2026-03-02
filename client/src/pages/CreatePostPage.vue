<template>
    <div class="glass box">
      <div class="title">Create post</div>
      <div class="muted">Share a thought. Add an image if you want.</div>
  
      <div class="grid">
        <input class="input" v-model="title" placeholder="Title" />
  
        <textarea class="input" v-model="content" rows="6" placeholder="Write your post..."></textarea>
  
        <div class="uploadRow">
          <input ref="fileRef" class="input" type="file" accept="image/*" />
          <button class="btn" :disabled="uploading" @click="uploadImage">
            {{ uploading ? "Uploading..." : "Upload image" }}
          </button>
        </div>
  
        <div v-if="imageUrl" class="preview glass">
          <img :src="imageUrl" />
          <button class="btn btn-danger" @click="clearImage">Remove image</button>
        </div>
  
        <div class="actions">
          <button class="btn btn-primary" :disabled="posting" @click="submit">
            {{ posting ? "Posting..." : "Post" }}
          </button>
          <button class="btn" @click="cancel">Cancel</button>
        </div>
  
        <div v-if="error" class="err">{{ error }}</div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import axios from "axios";
  import { usePostsStore } from "../stores/posts";
  
  export default {
    name: "CreatePostPage",
    setup() {
      const router = useRouter();
      const posts = usePostsStore();
  
      const title = ref("");
      const content = ref("");
      const imageUrl = ref("");
  
      const fileRef = ref(null);
      const uploading = ref(false);
      const posting = ref(false);
      const error = ref("");
  
      async function uploadImage() {
        error.value = "";
  
        const file = fileRef.value?.files?.[0];
        if (!file) return;
  
        uploading.value = true;
  
        try {
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
          const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
          if (!cloudName || !preset) {
            error.value = "Missing Cloudinary env variables";
            uploading.value = false;
            return;
          }
  
          const form = new FormData();
          form.append("file", file);
          form.append("upload_preset", preset);
  
          const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
          const res = await axios.post(url, form);
          imageUrl.value = res.data.secure_url || "";
          fileRef.value.value = "";
        } catch (err) {
          error.value =
            err?.response?.data?.error?.message ||
            "Upload failed";
        } finally {
          uploading.value = false;
        }
      }
  
      function clearImage() {
        imageUrl.value = "";
      }
  
      async function submit() {
        error.value = "";
  
        if (!title.value.trim() || !content.value.trim()) {
          error.value = "Title and content are required";
          return;
        }
  
        posting.value = true;
  
        const res = await posts.createPost({
          title: title.value.trim(),
          content: content.value.trim(),
          imageUrl: imageUrl.value || ""
        });
  
        posting.value = false;
  
        if (!res.ok) {
          error.value = res.error;
          return;
        }
  
        await posts.fetchFeedFirstPage();
        router.push("/");
      }
  
      function cancel() {
        router.push("/");
      }
  
      return {
        title,
        content,
        imageUrl,
        fileRef,
        uploading,
        posting,
        error,
        uploadImage,
        clearImage,
        submit,
        cancel
      };
    }
  };
  </script>
  
  <style scoped>
  .box {
    padding: 16px;
    border-radius: var(--radius);
  }
  
  .title {
    font-size: 22px;
    font-weight: 950;
    margin-bottom: 4px;
  }
  
  .grid {
    margin-top: 12px;
    display: grid;
    gap: 10px;
  }
  
  .uploadRow {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    align-items: center;
  }
  
  .preview {
    padding: 12px;
    border-radius: 16px;
    display: grid;
    gap: 10px;
  }
  
  .preview img {
    width: 100%;
    max-height: 320px;
    object-fit: cover;
    border-radius: 14px;
    border: 1px solid var(--line);
  }
  
  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .err {
    color: #dc2626;
    font-weight: 750;
  }
  </style>